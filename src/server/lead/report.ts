import { count, countDistinct, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { deposit, lead, quote, quoteItem } from "@/server/db/schema";

export type ReportStats = Awaited<ReturnType<typeof getReportStats>>;

const MONTHS = 6;

// Vietnamese month label, e.g. "T9/25".
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `T${Number(m)}/${y.slice(2)}`;
}

export async function getReportStats() {
  // ---- Headline KPIs -------------------------------------------------------

  // Tiền cọc thực nhận (doanh thu đã thu).
  const [rev] = await db
    .select({ sum: sql<string>`coalesce(sum(${deposit.amount}), 0)` })
    .from(deposit);
  const revenueTotal = Number(rev?.sum ?? 0);

  // Giá trị các báo giá đã chốt (accepted) — giá trị hợp đồng.
  const [signed] = await db
    .select({ sum: sql<string>`coalesce(sum(${quote.total}), 0)` })
    .from(quote)
    .where(eq(quote.status, "accepted"));
  const signedValue = Number(signed?.sum ?? 0);

  // Số công trình = số lead đã phát sinh cọc (distinct lead).
  const [proj] = await db
    .select({ n: countDistinct(deposit.leadId) })
    .from(deposit);
  const projectCount = Number(proj?.n ?? 0);

  // Số công trình hoàn thành.
  const [done] = await db
    .select({ n: count() })
    .from(lead)
    .where(eq(lead.status, "COMPLETED"));
  const completedCount = Number(done?.n ?? 0);

  // Tổng lead để tính tỷ lệ chuyển đổi.
  const [tot] = await db.select({ n: count() }).from(lead);
  const totalLeads = Number(tot?.n ?? 0);
  const conversionRate = totalLeads > 0 ? Math.round((projectCount / totalLeads) * 1000) / 10 : 0;

  // ---- Doanh thu & công trình theo tháng (MONTHS gần đây) ------------------

  const since = new Date();
  since.setMonth(since.getMonth() - (MONTHS - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const monthRows = await db
    .select({
      m: sql<string>`to_char(${deposit.paidAt}, 'YYYY-MM')`,
      revenue: sql<string>`coalesce(sum(${deposit.amount}), 0)`,
      projects: countDistinct(deposit.leadId),
    })
    .from(deposit)
    .where(gte(deposit.paidAt, since))
    .groupBy(sql`to_char(${deposit.paidAt}, 'YYYY-MM')`);

  const monthMap = new Map(
    monthRows.map((r) => [r.m, { revenue: Number(r.revenue), projects: Number(r.projects) }]),
  );

  const byMonth: { month: string; label: string; revenue: number; projects: number }[] = [];
  for (let i = 0; i < MONTHS; i++) {
    const dt = new Date(since);
    dt.setMonth(since.getMonth() + i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const hit = monthMap.get(key);
    byMonth.push({
      month: key,
      label: monthLabel(key),
      revenue: hit?.revenue ?? 0,
      projects: hit?.projects ?? 0,
    });
  }

  // ---- Kết quả theo nhân viên sales ---------------------------------------

  const salesUsers = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.role, ["sales", "admin"]));

  const leadsBySales = await db
    .select({ id: lead.assignedSalesId, n: count() })
    .from(lead)
    .groupBy(lead.assignedSalesId);
  const leadsMap = new Map(leadsBySales.map((r) => [r.id, Number(r.n)]));

  const completedBySales = await db
    .select({ id: lead.assignedSalesId, n: count() })
    .from(lead)
    .where(eq(lead.status, "COMPLETED"))
    .groupBy(lead.assignedSalesId);
  const completedMap = new Map(completedBySales.map((r) => [r.id, Number(r.n)]));

  const revenueBySales = await db
    .select({
      id: lead.assignedSalesId,
      revenue: sql<string>`coalesce(sum(${deposit.amount}), 0)`,
      projects: countDistinct(deposit.leadId),
    })
    .from(deposit)
    .innerJoin(lead, eq(deposit.leadId, lead.id))
    .groupBy(lead.assignedSalesId);
  const revenueMap = new Map(
    revenueBySales.map((r) => [r.id, { revenue: Number(r.revenue), projects: Number(r.projects) }]),
  );

  const salesPerformance = salesUsers
    .map((u) => {
      const rv = revenueMap.get(u.id);
      const leads = leadsMap.get(u.id) ?? 0;
      const projects = rv?.projects ?? 0;
      return {
        id: u.id,
        name: u.name ?? "—",
        leads,
        projects,
        completed: completedMap.get(u.id) ?? 0,
        revenue: rv?.revenue ?? 0,
        conversion: leads > 0 ? Math.round((projects / leads) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return {
    revenueTotal,
    signedValue,
    projectCount,
    completedCount,
    totalLeads,
    conversionRate,
    byMonth,
    salesPerformance,
  };
}

// ---- Toàn bộ báo giá (cho admin xem tập trung) ----------------------------

export type QuoteReportRow = Awaited<ReturnType<typeof listQuotesForReport>>[number];

export async function listQuotesForReport() {
  const rows = await db
    .select({
      id: quote.id,
      leadId: quote.leadId,
      leadName: lead.name,
      leadPhone: lead.phone,
      salesName: user.name,
      total: quote.total,
      note: quote.note,
      status: quote.status,
      createdAt: quote.createdAt,
    })
    .from(quote)
    .innerJoin(lead, eq(quote.leadId, lead.id))
    .leftJoin(user, eq(lead.assignedSalesId, user.id))
    .orderBy(desc(quote.createdAt));

  const items = rows.length
    ? await db
        .select()
        .from(quoteItem)
        .where(
          inArray(
            quoteItem.quoteId,
            rows.map((r) => r.id),
          ),
        )
    : [];

  return rows.map((r) => ({
    ...r,
    total: Number(r.total),
    salesName: r.salesName ?? "Chưa gán",
    items: items
      .filter((it) => it.quoteId === r.id)
      .map((it) => ({
        name: it.name,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
  }));
}
