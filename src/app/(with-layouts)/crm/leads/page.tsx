import type { Metadata } from "next";
import Link from "next/link";
import { LeadSourceBadge, LeadStatusBadge } from "@/components/crm/status-badge";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUS_ORDER, type LeadStatus } from "@/lib/lead-status";
import { getCurrentUser } from "@/server/auth/session";
import { listAssignableUsers } from "@/server/members/queries";
import { listLeads } from "@/server/lead/queries";
import { AddLeadButton } from "./_components/add-lead-button";
import { LeadsFilter } from "./_components/leads-filter";

export const metadata: Metadata = {
  title: "Danh sách lead",
};

export const dynamic = "force-dynamic";

const headCellClass =
  "px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary whitespace-nowrap";
const bodyCellClass =
  "h-16 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] text-text-primary";

function parseStatus(value?: string): LeadStatus | undefined {
  return (LEAD_STATUS_ORDER as readonly string[]).includes(value ?? "")
    ? (value as LeadStatus)
    : undefined;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    salesId?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { status, q, salesId, from, to } = await searchParams;
  const parsedStatus = parseStatus(status);
  const [leads, user, salesUsers] = await Promise.all([
    listLeads({ status: parsedStatus, q, salesId, from, to }),
    getCurrentUser(),
    listAssignableUsers(),
  ]);
  const canCreate = user?.role === "sales" || user?.role === "admin";

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Danh sách lead</h1>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/dashboard", label: "CRM" },
            { href: "/crm/leads", label: "Danh sách lead" },
          ]}
        />
      </div>

      {canCreate && (
        <div className="flex justify-end px-2 lg:px-5">
          <AddLeadButton />
        </div>
      )}

      <div className="space-y-4 px-2 lg:px-5">
        <LeadsFilter
          status={parsedStatus}
          q={q}
          salesId={salesId}
          from={from}
          to={to}
          salesUsers={salesUsers}
        />

        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className={headCellClass}>Tên khách</TableHead>
                  <TableHead className={headCellClass}>SĐT</TableHead>
                  <TableHead className={headCellClass}>Trạng thái</TableHead>
                  <TableHead className={headCellClass}>Sales phụ trách</TableHead>
                  <TableHead className={headCellClass}>Nguồn</TableHead>
                  <TableHead className={headCellClass}>Cập nhật</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="px-6 py-10 text-center text-sm text-text-secondary"
                      colSpan={6}
                    >
                      Không có lead phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} className="[&_td]:border-none">
                      <TableCell className={bodyCellClass}>
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="font-medium text-neutral-brand-color"
                        >
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                        {lead.phone}
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className={bodyCellClass}>{lead.salesName ?? "—"}</TableCell>
                      <TableCell className={bodyCellClass}>
                        <LeadSourceBadge source={lead.source} />
                      </TableCell>
                      <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                        {formatDateTime(lead.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableRoot>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
