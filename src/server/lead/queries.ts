import { and, desc, eq, getTableColumns, ilike, inArray, or } from "drizzle-orm";
import type { LeadStatus } from "@/lib/lead-status";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import {
  designTask,
  designVersion,
  deposit,
  lead,
  leadStatusHistory,
  quote,
  quoteItem,
  surveyAppointment,
  surveyResult,
} from "@/server/db/schema";

// Full lead list with optional status filter and name/phone search.
export async function listLeads(params: { status?: LeadStatus; q?: string }) {
  const conditions = [];
  if (params.status) conditions.push(eq(lead.status, params.status));
  if (params.q?.trim()) {
    const like = `%${params.q.trim()}%`;
    conditions.push(or(ilike(lead.name, like), ilike(lead.phone, like)));
  }

  return db
    .select({ ...getTableColumns(lead), salesName: user.name })
    .from(lead)
    .leftJoin(user, eq(lead.assignedSalesId, user.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(lead.createdAt));
}

export type LeadDetail = NonNullable<Awaited<ReturnType<typeof getLeadDetail>>>;

// Lead detail with all related records, aggregated for the detail page.
export async function getLeadDetail(id: string) {
  const [row] = await db
    .select({ ...getTableColumns(lead), salesName: user.name })
    .from(lead)
    .leftJoin(user, eq(lead.assignedSalesId, user.id))
    .where(eq(lead.id, id))
    .limit(1);

  if (!row) return null;

  const histories = await db
    .select({ ...getTableColumns(leadStatusHistory), userName: user.name })
    .from(leadStatusHistory)
    .leftJoin(user, eq(leadStatusHistory.userId, user.id))
    .where(eq(leadStatusHistory.leadId, id))
    .orderBy(desc(leadStatusHistory.createdAt));

  const quotes = await db
    .select()
    .from(quote)
    .where(eq(quote.leadId, id))
    .orderBy(desc(quote.createdAt));

  const items = quotes.length
    ? await db
        .select()
        .from(quoteItem)
        .where(
          inArray(
            quoteItem.quoteId,
            quotes.map((q) => q.id),
          ),
        )
    : [];

  const quotesWithItems = quotes.map((q) => ({
    ...q,
    items: items.filter((it) => it.quoteId === q.id),
  }));

  const deposits = await db
    .select()
    .from(deposit)
    .where(eq(deposit.leadId, id))
    .orderBy(desc(deposit.paidAt));

  const appointments = await db
    .select({ ...getTableColumns(surveyAppointment), technicianName: user.name })
    .from(surveyAppointment)
    .leftJoin(user, eq(surveyAppointment.technicianId, user.id))
    .where(eq(surveyAppointment.leadId, id))
    .orderBy(desc(surveyAppointment.scheduledAt));

  const results = await db
    .select()
    .from(surveyResult)
    .where(eq(surveyResult.leadId, id))
    .orderBy(desc(surveyResult.createdAt));

  const [task] = await db
    .select({ ...getTableColumns(designTask), designerName: user.name })
    .from(designTask)
    .leftJoin(user, eq(designTask.designerId, user.id))
    .where(eq(designTask.leadId, id))
    .limit(1);

  const versions = task
    ? await db
        .select()
        .from(designVersion)
        .where(eq(designVersion.designTaskId, task.id))
        .orderBy(desc(designVersion.createdAt))
    : [];

  return {
    lead: row,
    histories,
    quotes: quotesWithItems,
    deposits,
    appointments,
    results,
    design: task ? { task, versions } : null,
  };
}
