import { asc, desc, inArray } from "drizzle-orm";
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

// Users that can be assigned to a lead (for filter dropdowns): sales + admin.
export async function listAssignableUsers() {
  return db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.role, ["sales", "admin"]))
    .orderBy(asc(user.name));
}

export type AssignableUser = Awaited<ReturnType<typeof listAssignableUsers>>[number];
