import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationPayload = {
  userId: number;
  title: string;
  body: string;
  link?: string;
};

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(payload: NotificationPayload) {
    return this.prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        link: payload.link ?? null,
      },
    });
  }

  /** Create multiple notifications at once (e.g. notify both client & trainer) */
  async createMany(payloads: NotificationPayload[]) {
    return this.prisma.notification.createMany({ data: payloads });
  }
}
