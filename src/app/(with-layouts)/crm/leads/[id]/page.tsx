import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadSourceBadge, LeadStatusBadge } from "@/components/crm/status-badge";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/server/auth/session";
import { getLeadDetail } from "@/server/lead/queries";
import { DepositBlock, DesignBlock, QuoteBlock, SurveyBlock } from "./_components/lead-detail-blocks";
import { StatusTimeline } from "./_components/status-timeline";
import { TransitionActions } from "./_components/transition-actions";

export const metadata: Metadata = {
  title: "Chi tiết lead",
};

export const dynamic = "force-dynamic";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const detail = await getLeadDetail(id);
  if (!detail) notFound();

  const { lead } = detail;
  const canManage =
    user?.role === "admin" || (user?.role === "sales" && lead.assignedSalesId === user.id);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] leading-8 font-medium text-text-primary">{lead.name}</h1>
          <LeadStatusBadge status={lead.status} />
        </div>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/dashboard", label: "CRM" },
            { href: "/crm/leads", label: "Danh sách lead" },
            { href: `/crm/leads/${lead.id}`, label: "Chi tiết" },
          ]}
        />
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin khách</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoRow label="Họ tên" value={lead.name} />
            <InfoRow label="Số điện thoại" value={lead.phone} />
            <InfoRow label="Email" value={lead.email ?? "—"} />
            <InfoRow label="Nguồn" value={<LeadSourceBadge source={lead.source} />} />
            <InfoRow label="Sales phụ trách" value={lead.salesName ?? "Chưa nhận"} />
            <InfoRow label="Tạo lúc" value={formatDateTime(lead.createdAt)} />
            <InfoRow label="Nhu cầu / ghi chú" value={lead.note ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chuyển trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role ? (
              <TransitionActions leadId={lead.id} status={lead.status} role={user.role} />
            ) : (
              <p className="text-sm text-text-secondary">Bạn chưa được phân quyền.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <QuoteBlock quotes={detail.quotes} leadId={lead.id} canManage={canManage} />
          <DepositBlock deposits={detail.deposits} leadId={lead.id} canManage={canManage} />
          <SurveyBlock appointments={detail.appointments} results={detail.results} />
          <DesignBlock design={detail.design} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lịch sử trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline histories={detail.histories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
