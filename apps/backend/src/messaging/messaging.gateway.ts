import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagingService } from "./messaging.service";
import { jwtVerify } from "jose";
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({
  // Fix #3: Use env var so production domain is not blocked
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private activeUsers = new Map<number, Set<string>>();
  private userStatuses = new Map<number, "online" | "away" | "offline">();

  constructor(private messagingService: MessagingService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const secretKey = new TextEncoder().encode(
        process.env.JWT_SECRET,
      );

      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      const session = payload as any;
      const userId = Number(session.user?.id || session.sub);

      if (!userId) {
        throw new Error("No user ID found in session payload");
      }

      client.data.userId = userId;

      if (!this.activeUsers.has(userId)) {
        this.activeUsers.set(userId, new Set());
      }
      this.activeUsers.get(userId)!.add(client.id);

      // Default status to online
      this.userStatuses.set(userId, "online");

      // Broadcast online status to all users
      this.server.emit("user_status", { userId, status: "online" });

      // Send all current active statuses to the newly connected user
      const statuses = Array.from(this.userStatuses.entries()).map(
        ([id, stat]) => ({
          userId: id,
          status: stat,
        }),
      );
      client.emit("initial_statuses", statuses);
    } catch (error) {
      // Fix #4: error is unknown — safely access message
      console.error("WebSocket Auth Error:", (error as Error).message ?? error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.activeUsers.has(userId)) {
      this.activeUsers.get(userId)!.delete(client.id);
      if (this.activeUsers.get(userId)!.size === 0) {
        this.activeUsers.delete(userId);
        this.userStatuses.delete(userId);
        this.server.emit("user_status", { userId, status: "offline" });
      }
    }
  }

  @SubscribeMessage("join_conversation")
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: number,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const conversation = await this.messagingService.getConversationById(
      conversationId,
    );
    if (
      !conversation ||
      (conversation.trainerUserId !== userId &&
        conversation.clientUserId !== userId)
    ) {
      return; // Unauthorized join attempt
    }

    client.join(`conv:${conversationId}`);
  }

  @SubscribeMessage("send_message")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { 
      conversationId: number; 
      content: string;
      type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "AUDIO";
      imageUrl?: string;
      fileUrl?: string;
    },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const conversation = await this.messagingService.getConversationById(
      payload.conversationId,
    );
    if (
      !conversation ||
      (conversation.trainerUserId !== userId &&
        conversation.clientUserId !== userId)
    ) {
      return; // Unauthorized message attempt
    }

    const message = await this.messagingService.saveMessage(
      payload.conversationId,
      userId,
      payload.content,
      payload.type || "TEXT",
      payload.imageUrl,
      payload.fileUrl,
    );

    // Broadcast the message to the conversation room
    this.server
      .to(`conv:${payload.conversationId}`)
      .emit("new_message", message);

    // Deliver a real-time alert to all active connections of the recipient
    const recipientId =
      userId === conversation.trainerUserId
        ? conversation.clientUserId
        : conversation.trainerUserId;

    const recipientSockets = this.activeUsers.get(recipientId);
    if (recipientSockets) {
      for (const socketId of recipientSockets) {
        this.server.to(socketId).emit("new_message_alert", {
          conversationId: payload.conversationId,
          messageId: message.id,
          senderId: userId,
          content: payload.content,
          senderName: (message as any).sender?.name || "New Message",
          type: payload.type || "TEXT",
        });
      }
    }
  }

  @SubscribeMessage("typing")
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    const conversation = await this.messagingService.getConversationById(
      payload.conversationId,
    );
    if (
      !conversation ||
      (conversation.trainerUserId !== userId &&
        conversation.clientUserId !== userId)
    ) {
      return; // Unauthorized typing event
    }

    client.to(`conv:${payload.conversationId}`).emit("typing", {
      userId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage("update_status")
  async handleUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { status: "online" | "away" | "offline" },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    if (payload.status === "offline") {
      this.userStatuses.delete(userId);
    } else {
      this.userStatuses.set(userId, payload.status);
    }

    this.server.emit("user_status", { userId, status: payload.status });
  }

  @SubscribeMessage("read_messages")
  async handleReadMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: number },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.messagingService.markAsRead(payload.conversationId, userId);

    // Notify room participants that messages have been read
    this.server.to(`conv:${payload.conversationId}`).emit("messages_read", {
      conversationId: payload.conversationId,
      userId,
    });
  }

  @OnEvent('notification.created')
  handleNotificationCreated(notification: any) {
    const userId = notification.userId;
    const recipientSockets = this.activeUsers.get(userId);
    if (recipientSockets) {
      for (const socketId of recipientSockets) {
        this.server.to(socketId).emit("new_notification", notification);
      }
    }
  }
}

