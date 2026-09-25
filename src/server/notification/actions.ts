"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { notification } from "@/server/db/schema";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isUnread: boolean;
  createdAt: string;
};

export type MyNotifications = {
  items: NotificationItem[];
  unreadCount: number;
};

// Recent notifications for the current user (most recent first).
export async function getMyNotificationsAction(): Promise<MyNotifications> {
  const current = await getCurrentUser();
  if (!current) return { items: [], unreadCount: 0 };

  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, current.id))
    .orderBy(desc(notification.createdAt))
    .limit(30);

  const items: NotificationItem[] = rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    linkUrl: r.linkUrl,
    isUnread: r.readAt === null,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, unreadCount: items.filter((i) => i.isUnread).length };
}

export async function markNotificationReadAction(id: string): Promise<{ ok: boolean }> {
  const current = await getCurrentUser();
  if (!current) return { ok: false };

  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, id), eq(notification.userId, current.id), isNull(notification.readAt)));

  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<{ ok: boolean }> {
  const current = await getCurrentUser();
  if (!current) return { ok: false };

  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, current.id), isNull(notification.readAt)));

  return { ok: true };
}
