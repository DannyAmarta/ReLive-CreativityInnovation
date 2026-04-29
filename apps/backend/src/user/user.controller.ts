import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Req,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
// Remove the 'import * as Express' line if it's causing issues

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('upload-avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
    @UploadedFile() file: any,
    @Req() req: any, // Use @Req to grab the raw body
    ) {
    // Extract directly from the body bypasses DTO validation issues
    const userId = req.body.userId || req.body.id; 

    if (!file) throw new BadRequestException('No file uploaded.');
    if (!userId) throw new BadRequestException(`User ID missing. Found keys: ${Object.keys(req.body)}`);

    return this.userService.updateAvatar(Number(userId), file.filename);
    }
}