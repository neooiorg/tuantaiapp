"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { deposit, lead, quote, quoteItem } from "@/server/db/schema";
import { sendQuoteCreatedToAdmins } from "@/server/email/resend";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type QuoteItemInput = { name: string; quantity: number; unitPrice: number };
export type DepositInput = { amount: number; paidAt: string; method?: string; note?: string };

// Only the assigned sales (or an admin) may add quotes/deposits to a lead.
async function requireLeadManager(leadId: string) {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "sales") {
    throw new Error("FORBIDDEN");
  }
  const [row] = await db.select().from(lead).where(eq(lead.id, leadId)).limit(1);
  if (!row) throw new Error("LEAD_NOT_FOUND");
  if (user.role === "sales" && row.assignedSalesId !== user.id) {
    throw new Error("FORBIDDEN");
  }
  return { user, lead: row };
}

function toResult(err: unknown): ActionResult {
  if (err instanceof Error) {
    if (err.message === "FORBIDDEN") return { ok: false, error: "Bạn không có quyền thao tác lead này." };
    if (err.message === "LEAD_NOT_FOUND") return { ok: false, error: "Không tìm thấy lead." };
    if (err.message === "UNAUTHENTICATED" || err.message === "NO_ROLE")
      return { ok: false, error: "Bạn chưa đăng nhập hoặc chưa được phân quyền." };
  }
  console.error("[quote/deposit] unexpected error", err);
  return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
}

export async function createQuoteAction(
  leadId: string,
  items: QuoteItemInput[],
  note?: string,
): Promise<ActionResult> {
  try {
    const { user: actor, lead: leadRow } = await requireLeadManager(leadId);

    const validItems = items
      .map((it) => ({
        name: it.name.trim(),
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      }))
      .filter((it) => it.name && it.quantity > 0 && it.unitPrice >= 0);

    if (validItems.length === 0) {
      return { ok: false, error: "Cần ít nhất một hạng mục hợp lệ." };
    }

    const total = validItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

    const [created] = await db
      .insert(quote)
      .values({ leadId, total: total.toFixed(2), note: note?.trim() || null, status: "draft" })
      .returning({ id: quote.id });

    await db.insert(quoteItem).values(
      validItems.map((it) => ({
        quoteId: created.id,
        name: it.name,
        quantity: it.quantity.toString(),
        unitPrice: it.unitPrice.toFixed(2),
      })),
    );

    // Notify admins of the new quote (total + line items). Non-fatal.
    try {
      const admins = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.role, "admin"));
      await sendQuoteCreatedToAdmins(
        admins.map((a) => a.email),
        {
          leadId,
          leadName: leadRow.name,
          leadPhone: leadRow.phone,
          salesName: actor.name,
          total,
          note: note?.trim() || null,
          items: validItems,
        },
      );
    } catch (mailErr) {
      console.error("[quote] admin notify failed (non-fatal):", mailErr);
    }

    revalidatePath(`/crm/leads/${leadId}`);
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}

export async function recordDepositAction(
  leadId: string,
  input: DepositInput,
): Promise<ActionResult> {
  try {
    await requireLeadManager(leadId);

    const amount = Number(input.amount);
    if (!(amount > 0)) return { ok: false, error: "Số tiền cọc phải lớn hơn 0." };

    const paidAt = new Date(input.paidAt);
    if (Number.isNaN(paidAt.getTime())) return { ok: false, error: "Ngày cọc không hợp lệ." };

    await db.insert(deposit).values({
      leadId,
      amount: amount.toFixed(2),
      paidAt,
      method: input.method?.trim() || null,
      note: input.note?.trim() || null,
    });

    revalidatePath(`/crm/leads/${leadId}`);
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}
