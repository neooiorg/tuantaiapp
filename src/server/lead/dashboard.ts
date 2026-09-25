import { count, eq, gte, sql } from "drizzle-orm";
import { LEAD_STATUS_ORDER, STATUS_LABELS } from "@/lib/lead-status";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { deposit, lead } from "@/server/db/schema";

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getDashboardStats() {
  const statusRows = await db
    .select({ status: lead.status, n: count() })
    .from(lead)
    .groupBy(lead.status);

  const statusMap = new Map(statusRows.map((r) => [r.status, Number(r.n)]));
  const statusCounts = LEAD_STATUS_ORDER.map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    count: statusMap.get(s) ?? 0,
  }));

  const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const newCount = statusMap.get("NEW") ?? 0;
  const completed = statusMap.get("COMPLETED") ?? 0;
  const inProgress = total - newCount - completed;

  // Leads grouped by the assigned salesperson (intake is fully manual now).
  const salesRows = await db
    .select({ name: user.name, n: count() })
    .from(lead)
    .leftJoin(user, eq(lead.assignedSalesId, user.id))
    .groupBy(user.name);
  const bySales = salesRows
    .map((r) => ({ name: r.name ?? "Chưa gán", count: Number(r.n) }))
    .sort((a, b) => b.count - a.count);

  const [dep] = await db
    .select({ sum: sql<string>`coalesce(sum(${deposit.amount}), 0)` })
    .from(deposit);
  const depositTotal = Number(dep?.sum ?? 0);

  // New leads per day for the last 14 days.
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const perDayRows = await db
    .select({
      d: sql<string>`to_char(${lead.createdAt}, 'YYYY-MM-DD')`,
      n: count(),
    })
    .from(lead)
    .where(gte(lead.createdAt, since))
    .groupBy(sql`to_char(${lead.createdAt}, 'YYYY-MM-DD')`);

  const perDayMap = new Map(perDayRows.map((r) => [r.d, Number(r.n)]));
  const leadsPerDay: { date: string; label: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const dt = new Date(since);
    dt.setDate(since.getDate() + i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    leadsPerDay.push({
      date: key,
      label: `${dt.getDate()}/${dt.getMonth() + 1}`,
      count: perDayMap.get(key) ?? 0,
    });
  }

  return {
    total,
    newCount,
    inProgress,
    completed,
    depositTotal,
    statusCounts,
    bySales,
    leadsPerDay,
  };
}
