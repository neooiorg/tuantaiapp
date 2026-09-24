import { and, eq, isNotNull, sql } from "drizzle-orm";
import { findTransition, type AppRole } from "@/lib/permissions";
import type { LeadStatus } from "@/lib/lead-status";
import { db } from "@/server/db";
import {
  designTask,
  designVersion,
  deposit,
  lead,
  leadStatusHistory,
  quote,
  surveyAppointment,
  surveyResult,
} from "@/server/db/schema";

export type TransitionErrorCode =
  | "LEAD_NOT_FOUND"
  | "INVALID_TRANSITION"
  | "FORBIDDEN_ROLE"
  | "FORBIDDEN_SCOPE"
  | "NOTE_REQUIRED"
  | "PRECONDITION_FAILED"
  | "CONFLICT";

export class TransitionError extends Error {
  code: TransitionErrorCode;
  constructor(code: TransitionErrorCode, message: string) {
    super(message);
    this.name = "TransitionError";
    this.code = code;
  }
}

export type TransitionActor = { id: string; role: AppRole };

export interface TransitionParams {
  leadId: string;
  to: LeadStatus;
  note?: string;
}

async function hasRow(query: Promise<{ id: string }[]>): Promise<boolean> {
  return (await query).length > 0;
}

// Enforce the per-transition data requirements from the spec.
async function assertPreconditions(leadId: string, to: LeadStatus): Promise<void> {
  switch (to) {
    case "QUOTED": {
      const ok = await hasRow(
        db.select({ id: quote.id }).from(quote).where(eq(quote.leadId, leadId)).limit(1),
      );
      if (!ok) throw new TransitionError("PRECONDITION_FAILED", "Cần có ít nhất một báo giá trước khi chuyển.");
      return;
    }
    case "DEPOSITED": {
      const ok = await hasRow(
        db.select({ id: deposit.id }).from(deposit).where(eq(deposit.leadId, leadId)).limit(1),
      );
      if (!ok) throw new TransitionError("PRECONDITION_FAILED", "Cần ghi nhận tiền cọc trước khi chuyển.");
      return;
    }
    case "AWAITING_SURVEY": {
      const ok = await hasRow(
        db
          .select({ id: surveyAppointment.id })
          .from(surveyAppointment)
          .where(and(eq(surveyAppointment.leadId, leadId), isNotNull(surveyAppointment.technicianId)))
          .limit(1),
      );
      if (!ok)
        throw new TransitionError(
          "PRECONDITION_FAILED",
          "Cần tạo lịch khảo sát và giao kỹ thuật trước khi chuyển.",
        );
      return;
    }
    case "SURVEYED": {
      const rows = await db
        .select({ id: surveyResult.id, measurements: surveyResult.measurements })
        .from(surveyResult)
        .where(eq(surveyResult.leadId, leadId));
      const ok = rows.some((r) => Array.isArray(r.measurements) && r.measurements.length > 0);
      if (!ok)
        throw new TransitionError("PRECONDITION_FAILED", "Cần nhập ít nhất một số đo khảo sát trước khi chuyển.");
      return;
    }
    case "DESIGNING": {
      const ok = await hasRow(
        db
          .select({ id: designTask.id })
          .from(designTask)
          .where(and(eq(designTask.leadId, leadId), isNotNull(designTask.designerId)))
          .limit(1),
      );
      if (!ok)
        throw new TransitionError("PRECONDITION_FAILED", "Cần giao designer (tạo task thiết kế) trước khi chuyển.");
      return;
    }
    case "AWAITING_APPROVAL": {
      const ok = await hasRow(
        db
          .select({ id: designVersion.id })
          .from(designVersion)
          .innerJoin(designTask, eq(designVersion.designTaskId, designTask.id))
          .where(eq(designTask.leadId, leadId))
          .limit(1),
      );
      if (!ok)
        throw new TransitionError("PRECONDITION_FAILED", "Cần tải lên ít nhất một bản thiết kế trước khi chuyển.");
      return;
    }
    default:
      // NEW/CLAIMED/CONSULTING/COMPLETED: no extra data requirement.
      return;
  }
}

// Resource scoping: technicians/designers only act on leads assigned to them;
// sales only act on leads they own (except claiming a NEW lead).
async function assertScope(
  actor: TransitionActor,
  current: { assignedSalesId: string | null; status: LeadStatus },
  leadId: string,
  to: LeadStatus,
): Promise<void> {
  if (actor.role === "admin") return;

  if (actor.role === "sales") {
    // Claiming a NEW lead: anyone in sales may claim.
    if (to === "CLAIMED") return;
    if (current.assignedSalesId !== actor.id)
      throw new TransitionError("FORBIDDEN_SCOPE", "Bạn không phụ trách lead này.");
    return;
  }

  if (actor.role === "technician") {
    const ok = await hasRow(
      db
        .select({ id: surveyAppointment.id })
        .from(surveyAppointment)
        .where(and(eq(surveyAppointment.leadId, leadId), eq(surveyAppointment.technicianId, actor.id)))
        .limit(1),
    );
    if (!ok) throw new TransitionError("FORBIDDEN_SCOPE", "Bạn không được giao khảo sát lead này.");
    return;
  }

  if (actor.role === "designer") {
    const ok = await hasRow(
      db
        .select({ id: designTask.id })
        .from(designTask)
        .where(and(eq(designTask.leadId, leadId), eq(designTask.designerId, actor.id)))
        .limit(1),
    );
    if (!ok) throw new TransitionError("FORBIDDEN_SCOPE", "Bạn không được giao thiết kế lead này.");
    return;
  }
}

export async function transitionLead(params: TransitionParams, actor: TransitionActor) {
  const { leadId, to } = params;
  const note = params.note?.trim() || null;

  const [current] = await db.select().from(lead).where(eq(lead.id, leadId)).limit(1);
  if (!current) throw new TransitionError("LEAD_NOT_FOUND", "Không tìm thấy lead.");

  const from = current.status;

  const def = findTransition(from, to);
  if (!def)
    throw new TransitionError(
      "INVALID_TRANSITION",
      `Không thể chuyển từ "${from}" sang "${to}".`,
    );

  if (actor.role !== "admin" && !def.roles.includes(actor.role))
    throw new TransitionError("FORBIDDEN_ROLE", "Vai trò của bạn không được phép thực hiện bước này.");

  if (def.requiresNote && !note)
    throw new TransitionError("NOTE_REQUIRED", "Vui lòng nhập ghi chú cho yêu cầu chỉnh sửa.");

  await assertScope(actor, current, leadId, to);
  await assertPreconditions(leadId, to);

  // Optimistic conditional update guards against concurrent transitions
  // (e.g. two sales claiming the same NEW lead).
  const [updated] = await db
    .update(lead)
    .set({
      status: to,
      updatedAt: new Date(),
      ...(to === "CLAIMED" ? { assignedSalesId: actor.id } : {}),
    })
    .where(and(eq(lead.id, leadId), eq(lead.status, from)))
    .returning();

  if (!updated)
    throw new TransitionError("CONFLICT", "Trạng thái lead vừa thay đổi, vui lòng tải lại trang.");

  await db.insert(leadStatusHistory).values({
    leadId,
    fromStatus: from,
    toStatus: to,
    userId: actor.id,
    note,
  });

  // Revision loop: AWAITING_APPROVAL -> DESIGNING bumps the revision counter.
  if (from === "AWAITING_APPROVAL" && to === "DESIGNING") {
    await db
      .update(designTask)
      .set({ revisionCount: sql`${designTask.revisionCount} + 1`, updatedAt: new Date() })
      .where(eq(designTask.leadId, leadId));
  }

  return updated;
}
