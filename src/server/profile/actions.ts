"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { requireUser } from "@/server/auth/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ProfileInput = {
  name: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  bio: string;
  image?: string | null;
};

function toResult(err: unknown): ActionResult {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED" || err.message === "NO_ROLE") {
      return { ok: false, error: "Bạn chưa đăng nhập hoặc chưa được phân quyền." };
    }
  }
  console.error("[profile] unexpected error", err);
  return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
}

// Normalizes an optional text field: trims and converts empty string to null.
function nullable(value: string): string | null {
  const v = value.trim();
  return v.length ? v : null;
}

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  try {
    const current = await requireUser();

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Vui lòng nhập họ tên." };

    await db
      .update(user)
      .set({
        name,
        phone: nullable(input.phone),
        website: nullable(input.website),
        address: nullable(input.address),
        country: nullable(input.country),
        bio: nullable(input.bio),
        ...(input.image !== undefined ? { image: input.image } : {}),
        updatedAt: new Date(),
      })
      .where(eq(user.id, current.id));

    revalidatePath("/profile/account");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}
