"use server";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ROLE_LABELS, isAppRole, type AppRole } from "@/lib/permissions";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import {
  designTask,
  lead,
  leadStatusHistory,
  surveyAppointment,
  surveyResult,
} from "@/server/db/schema";
import { sendMemberInvite, sendMemberRemoved, sendRoleChanged } from "@/server/email/resend";
import { requireUser } from "@/server/auth/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const current = await requireUser();
  if (current.role !== "admin") throw new Error("FORBIDDEN");
  return current;
}

function toResult(err: unknown): ActionResult {
  if (err instanceof Error) {
    if (err.message === "FORBIDDEN") return { ok: false, error: "Chỉ quản trị viên mới được thao tác." };
    if (err.message === "UNAUTHENTICATED" || err.message === "NO_ROLE") {
      return { ok: false, error: "Bạn chưa đăng nhập hoặc chưa được phân quyền." };
    }
  }
  console.error("[members] unexpected error", err);
  return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createMemberAction(input: {
  name: string;
  email: string;
  role: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name) return { ok: false, error: "Vui lòng nhập họ tên." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Email không hợp lệ." };
    if (!isAppRole(input.role)) return { ok: false, error: "Vai trò không hợp lệ." };
    const role: AppRole = input.role;

    // Random password: members sign in with Google; they never use this.
    const password = crypto.randomBytes(24).toString("base64url");

    let createdId: string;
    try {
      const created = await auth.api.createUser({
        body: { name, email, password, data: {} },
        headers: await headers(),
      });
      createdId = created.user.id;
    } catch {
      return { ok: false, error: "Không tạo được tài khoản (email có thể đã tồn tại)." };
    }

    // Set the app role (custom roles aren't part of the admin plugin's typed roles) and
    // mark the email verified so Google sign-in links to this account.
    await db.update(user).set({ role, emailVerified: true }).where(eq(user.id, createdId));

    await sendMemberInvite(email, name, ROLE_LABELS[role]);

    revalidatePath("/crm/members");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}

export async function updateMemberAction(
  userId: string,
  input: { name: string; role: string },
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const name = input.name.trim();
    if (!name) return { ok: false, error: "Vui lòng nhập họ tên." };
    if (!isAppRole(input.role)) return { ok: false, error: "Vai trò không hợp lệ." };
    const role: AppRole = input.role;

    const [existing] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!existing) return { ok: false, error: "Không tìm thấy thành viên." };

    await db.update(user).set({ name, role, updatedAt: new Date() }).where(eq(user.id, userId));

    if (existing.role !== role) {
      await sendRoleChanged(existing.email, name, ROLE_LABELS[role]);
    }

    revalidatePath("/crm/members");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}

export async function deleteMemberAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (userId === admin.id) return { ok: false, error: "Không thể xoá chính bạn." };

    const [member] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (!member) return { ok: false, error: "Không tìm thấy thành viên." };

    // Detach references so the FK constraints don't block deletion.
    await db.update(lead).set({ assignedSalesId: null }).where(eq(lead.assignedSalesId, userId));
    await db
      .update(surveyAppointment)
      .set({ technicianId: null })
      .where(eq(surveyAppointment.technicianId, userId));
    await db.update(surveyResult).set({ createdBy: null }).where(eq(surveyResult.createdBy, userId));
    await db.update(designTask).set({ designerId: null }).where(eq(designTask.designerId, userId));
    await db
      .update(leadStatusHistory)
      .set({ userId: null })
      .where(eq(leadStatusHistory.userId, userId));

    await db.delete(user).where(eq(user.id, userId));

    await sendMemberRemoved(member.email, member.name);

    revalidatePath("/crm/members");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}
