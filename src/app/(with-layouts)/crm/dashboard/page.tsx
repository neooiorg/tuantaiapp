import type { Metadata } from "next";
import { InvoiceIcon, LetterIcon, TaskIcon, UserGroupIcon } from "@/components/common/sidebar/icon";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { getDashboardStats } from "@/server/lead/dashboard";
import { LeadsTrendChart } from "./_components/leads-trend-chart";
import { RevenueDummyChart } from "./_components/revenue-dummy-chart";
import { SalesDonut } from "./_components/sales-donut";
import { StatusBarChart } from "./_components/status-bar-chart";

export const metadata: Metadata = {
  title: "Tổng quan",
};

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", iconClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="mt-6 p-0">
        <div className="mb-1.25 text-xl leading-7 font-semibold text-text-primary md:text-2xl md:leading-8">
          {value}
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <span className="text-sm leading-5 font-medium text-text-tertiary">{title}</span>
      </CardFooter>
    </Card>
  );
}

export default async function CrmDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Tổng quan</h1>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/dashboard", label: "CRM" },
            { href: "/crm/dashboard", label: "Tổng quan" },
          ]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng lead"
            value={stats.total}
            icon={<UserGroupIcon />}
            iconClass="bg-brand-100 text-brand-600"
          />
          <StatCard
            title="Lead mới"
            value={stats.newCount}
            icon={<LetterIcon />}
            iconClass="bg-primary-100 text-primary-600"
          />
          <StatCard
            title="Đang xử lý"
            value={stats.inProgress}
            icon={<TaskIcon />}
            iconClass="bg-primary-200 text-primary-700"
          />
          <StatCard
            title="Hoàn thành"
            value={stats.completed}
            icon={<InvoiceIcon />}
            iconClass="bg-brand-200 text-brand-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <StatusBarChart data={stats.statusCounts} />
          <SalesDonut data={stats.bySales} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <LeadsTrendChart data={stats.leadsPerDay} />
          <RevenueDummyChart depositTotal={stats.depositTotal} />
        </div>
      </div>
    </div>
  );
}
