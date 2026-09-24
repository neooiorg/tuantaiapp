"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@/lib/lead-status";
import { requireUser } from "@/server/auth/session";
import { TransitionError, transitionLead } from "./transition-lead";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function runTransition(leadId: string, to: LeadStatus, note?: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    await transitionLead({ leadId, to, note }, { id: user.id, role: user.role });

    revalidatePath("/crm/lead-inbox");
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

export async function claimLeadAction(leadId: string): Promise<ActionResult> {
  return runTransition(leadId, "CLAIMED");
}

export async function transitionLeadAction(
  leadId: string,
  to: LeadStatus,
  note?: string,
): Promise<ActionResult> {
  return runTransition(leadId, to, note);
}
