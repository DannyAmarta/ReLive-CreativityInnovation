import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export type NotificationPayload = {
  userId: number;
  title: string;
  body: string;
  link?: string;
};

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(payload: NotificationPayload) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        link: payload.link ?? null,
      },
    });

    this.eventEmitter.emit('notification.created', notification);
    return notification;
  }

  /** Create multiple notifications at once (e.g. notify both client & trainer) */
  async createMany(payloads: NotificationPayload[]) {
    return Promise.all(payloads.map((p) => this.create(p)));
  }
}
