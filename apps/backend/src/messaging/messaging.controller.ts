import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  ParseIntPipe,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { jwtVerify } from "jose";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";

@Controller("messaging")
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  private async extractUserIdFromRequest(req: any): Promise<number> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header",
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const secretKey = new TextEncoder().encode(
        process.env.JWT_SECRET,
      );
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      const session = payload as any;
      const userId = session.user?.id || session.sub;

      if (!userId) {
        throw new UnauthorizedException(
          "Invalid token payload: missing user ID",
        );
      }

      return Number(userId);
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  @Get("conversations")
  async getConversations(@Req() req: any) {
    const userId = await this.extractUserIdFromRequest(req);
    return this.messagingService.getUserConversations(userId);
  }

  @Get("conversations/unread-count")
  async getUnreadCount(@Req() req: any) {
    const userId = await this.extractUserIdFromRequest(req);
    return this.messagingService.getUnreadCount(userId);
  }

  @Get("conversations/:id/history")
  async getHistory(
    @Param("id", ParseIntPipe) conversationId: number,
    @Query("cursor") cursor: string,
    @Query("take") take: string,
    @Req() req: any,
  ) {
    const userId = await this.extractUserIdFromRequest(req);
    const cursorId = cursor ? parseInt(cursor, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : 50;

    return this.messagingService.getHistory(
      conversationId,
      userId,
      cursorId,
      takeNum,
    );
  }

  @Post("conversations/:id/read")
  async markAsRead(
    @Param("id", ParseIntPipe) conversationId: number,
    @Req() req: any,
  ) {
    const userId = await this.extractUserIdFromRequest(req);
    await this.messagingService.markAsRead(conversationId, userId);
    return { success: true };
  }

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = "./uploads/chat";
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `chat-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: any, @Req() req: any) {
    // Validate authorization token to protect upload endpoint
    await this.extractUserIdFromRequest(req);

    if (!file) throw new BadRequestException("No file uploaded.");

    const ext = extname(file.originalname).toLowerCase();
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const type = imageExtensions.includes(ext) ? "IMAGE" : "FILE";
    const fileUrl = `/uploads/chat/${file.filename}`;

    return {
      url: fileUrl,
      originalName: file.originalname,
      type,
    };
  }
}

