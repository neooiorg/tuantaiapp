import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { notification } from "@/server/db/schema";

export type NotificationInput = {
  type: string;
  title: string;
  body?: string | null;
  linkUrl?: string | null;
};

// Insert one notification per recipient. Server-only helper (not a server action).
export async function notifyUsers(userIds: string[], input: NotificationInput): Promise<void> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return;

  await db.insert(notification).values(
    ids.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkUrl: input.linkUrl ?? null,
    })),
  );
}

// Notify every admin, optionally excluding the actor who triggered the event.
export async function notifyAdmins(
  input: NotificationInput,
  excludeUserId?: string,
): Promise<void> {
  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"));

  const ids = admins.map((a) => a.id).filter((id) => id !== excludeUserId);
  await notifyUsers(ids, input);
}
