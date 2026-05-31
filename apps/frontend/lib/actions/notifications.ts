"use server";

import { getSession } from "@/lib/session.server";
import prisma from "@/lib/prisma";

export type NotificationRecord = {
  id: number;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export async function getMyNotifications(): Promise<NotificationRecord[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const userId = Number(session.user.id);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markAllNotificationsAsReadAction(): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) return;

  const userId = Number(session.user.id);

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function markNotificationAsReadAction(id: number): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) return;

  const userId = Number(session.user.id);

  await prisma.notification.updateMany({
    where: { id, userId, read: false },
    data: { read: true },
  });
}
