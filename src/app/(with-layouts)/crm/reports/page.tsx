import type { Metadata } from "next";
import { InvoiceIcon, PieChartIcon, TaskIcon, UserGroupIcon } from "@/components/common/sidebar/icon";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { formatVnd } from "@/lib/format";
import { getReportStats, listQuotesForReport } from "@/server/lead/report";
import { KpiCard } from "./_components/kpi-card";
import { ProjectsChart } from "./_components/projects-chart";
import { QuotesTable } from "./_components/quotes-table";
import { RevenueChart } from "./_components/revenue-chart";
import { SalesPerformanceTable } from "./_components/sales-performance-table";

export const metadata: Metadata = {
  title: "Báo cáo",
};

export const dynamic = "force-dynamic";

export default async function CrmReportsPage() {
  const [stats, quotes] = await Promise.all([getReportStats(), listQuotesForReport()]);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Báo cáo</h1>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/dashboard", label: "CRM" },
            { href: "/crm/reports", label: "Báo cáo" },
          ]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Doanh thu thực thu"
            value={formatVnd(stats.revenueTotal)}
            subtitle="Tổng tiền cọc đã nhận"
            icon={<InvoiceIcon />}
            iconClass="bg-brand-100 text-brand-600"
          />
          <KpiCard
            title="Giá trị hợp đồng chốt"
            value={formatVnd(stats.signedValue)}
            subtitle="Báo giá đã được duyệt"
            icon={<TaskIcon />}
            iconClass="bg-primary-100 text-primary-600"
          />
          <KpiCard
            title="Số công trình"
            value={String(stats.projectCount)}
            subtitle={`${stats.completedCount} công trình hoàn thành`}
            icon={<PieChartIcon />}
            iconClass="bg-primary-200 text-primary-700"
          />
          <KpiCard
            title="Tỷ lệ chuyển đổi"
            value={`${stats.conversionRate}%`}
            subtitle={`${stats.projectCount}/${stats.totalLeads} lead thành công`}
            icon={<UserGroupIcon />}
            iconClass="bg-brand-200 text-brand-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RevenueChart data={stats.byMonth} />
          <ProjectsChart data={stats.byMonth} />
        </div>

        <SalesPerformanceTable rows={stats.salesPerformance} />

        <QuotesTable rows={quotes} />
      </div>
    </div>
  );
}
