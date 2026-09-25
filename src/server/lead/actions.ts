"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@/lib/lead-status";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { lead, leadStatusHistory } from "@/server/db/schema";
import { TransitionError, transitionLead } from "./transition-lead";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CreateLeadResult = { ok: true; id: string } | { ok: false; error: string };

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  note?: string;
};

const PHONE_RE = /^[0-9+\-.\s()]{6,20}$/;

// Sales/admin create a lead by hand. The creator immediately owns it (status CLAIMED),
// matching the "tự tạo & tự nhận" flow.
export async function createLeadAction(input: CreateLeadInput): Promise<CreateLeadResult> {
  try {
    const user = await requireUser();
    if (user.role !== "sales" && user.role !== "admin") {
      return { ok: false, error: "Chỉ kinh doanh hoặc quản trị mới được tạo lead." };
    }

    const name = input.name.trim();
    const phone = input.phone.trim();
    const email = input.email?.trim() || null;
    const note = input.note?.trim() || null;

    if (!name) return { ok: false, error: "Vui lòng nhập tên khách." };
    if (!PHONE_RE.test(phone)) return { ok: false, error: "Số điện thoại không hợp lệ." };

    const [created] = await db
      .insert(lead)
      .values({
        name,
        phone,
        email,
        note,
        source: "manual",
        status: "CLAIMED",
        assignedSalesId: user.id,
      })
      .returning({ id: lead.id });

    await db.insert(leadStatusHistory).values({
      leadId: created.id,
      fromStatus: "NEW",
      toStatus: "CLAIMED",
      userId: user.id,
      note: "Tạo lead thủ công",
    });

    revalidatePath("/crm/leads");
    return { ok: true, id: created.id };
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "NO_ROLE")) {
      return { ok: false, error: "Bạn chưa đăng nhập hoặc chưa được phân quyền." };
    }
    console.error("[lead] create error", err);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

async function runTransition(leadId: string, to: LeadStatus, note?: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await transitionLead({ leadId, to, note }, { id: user.id, role: user.role });

    revalidatePath("/crm/leads");
    revalidatePath(`/crm/leads/${leadId}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof TransitionError) return { ok: false, error: err.message };
    if (err instanceof Error && (err.message === "UNAUTHENTICATED" || err.message === "NO_ROLE")) {
      return { ok: false, error: "Bạn chưa đăng nhập hoặc chưa được phân quyền." };
    }
    console.error("[transition] unexpected error", err);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

export async function transitionLeadAction(
  leadId: string,
  to: LeadStatus,
  note?: string,
): Promise<ActionResult> {
  return runTransition(leadId, to, note);
}
