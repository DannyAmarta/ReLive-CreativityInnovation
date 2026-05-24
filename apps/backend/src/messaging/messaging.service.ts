import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationService } from "../core/notification.service";

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // 1. Get or Create a conversation when a user starts chatting
  async getOrCreateConversation(
    trainerId: number,
    clientId: number,
    currentUserId: number,
  ) {
    if (currentUserId !== trainerId && currentUserId !== clientId) {
      throw new UnauthorizedException("Access denied to this conversation.");
    }

    // Verify that a booking exists between the trainer and the client
    const booking = await this.prisma.booking.findFirst({
      where: {
        clientId: clientId,
        trainer: {
          userId: trainerId,
        },
      },
    });

    if (!booking) {
      throw new UnauthorizedException(
        "No booking exists between this client and trainer. Access denied.",
      );
    }

    let conversation = await this.prisma.conversation.findUnique({
      where: {
        trainerUserId_clientUserId: {
          trainerUserId: trainerId,
          clientUserId: clientId,
        },
      },
      include: { trainerUser: true, clientUser: true },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          trainerUserId: trainerId,
          clientUserId: clientId,
          bookingId: booking.id, // Link to the booking
        },
        include: { trainerUser: true, clientUser: true },
      });
    }
    return conversation;
  }

  // Helper to fetch a conversation by ID
  async getConversationById(id: number) {
    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  // 2. List all active conversations for the dashboard/sidebar
  async getUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ trainerUserId: userId }, { clientUserId: userId }],
      },
      include: {
        trainerUser: { select: { id: true, name: true, avatar: true } },
        clientUser: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  // 3. Save a message to the DB, update conversation, and trigger notifications
  async saveMessage(conversationId: number, senderId: number, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException("Conversation not found");

    if (
      conversation.trainerUserId !== senderId &&
      conversation.clientUserId !== senderId
    ) {
      throw new UnauthorizedException("Access denied to this conversation.");
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        type: "TEXT",
      },
      include: {
        sender: {
          select: { name: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: message.id, lastMessageAt: new Date() },
    });

    // Create a database notification for the recipient
    const recipientId =
      senderId === conversation.trainerUserId
        ? conversation.clientUserId
        : conversation.trainerUserId;

    try {
      const recipient = await this.prisma.user.findUnique({
        where: { id: recipientId },
        select: { role: true },
      });
      const link =
        recipient?.role === "TRAINER"
          ? "/trainer/messages"
          : "/client/messages";

      await this.notificationService.create({
        userId: recipientId,
        title: message.sender?.name || "New Message",
        body: content,
        link,
      });
    } catch (error) {
      console.error("Failed to create chat notification record:", error);
    }

    return message;
  }

  // 4. Get message history using cursor pagination
  async getHistory(
    conversationId: number,
    userId: number,
    cursorId?: number,
    take: number = 50,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException("Conversation not found");
    if (
      userId !== conversation.trainerUserId &&
      userId !== conversation.clientUserId
    ) {
      throw new UnauthorizedException("Access denied.");
    }

    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      take,
      skip: cursorId ? 1 : 0, // Skip the cursor itself
      ...(cursorId ? { cursor: { id: cursorId } } : {}),
      orderBy: { createdAt: "desc" }, // Latest first for infinite scroll
    });
  }

  // 5. Mark messages in a conversation as read
  async markAsRead(conversationId: number, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("Conversation not found");
    if (
      conversation.trainerUserId !== userId &&
      conversation.clientUserId !== userId
    ) {
      throw new UnauthorizedException("Access denied.");
    }

    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // 6. Get total unread count for user
  async getUnreadCount(userId: number) {
    const count = await this.prisma.chatMessage.count({
      where: {
        conversation: {
          OR: [{ trainerUserId: userId }, { clientUserId: userId }],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });
    return { unreadCount: count };
  }
}

