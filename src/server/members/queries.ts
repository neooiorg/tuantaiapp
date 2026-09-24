import { desc } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";

export async function listMembers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
}

export type Member = Awaited<ReturnType<typeof listMembers>>[number];
