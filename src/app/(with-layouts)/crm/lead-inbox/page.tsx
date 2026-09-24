import type { Metadata } from "next";
import { LeadSourceBadge } from "@/components/crm/status-badge";
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
import { getCurrentUser } from "@/server/auth/session";
import { getInboxLeads } from "@/server/lead/queries";
import { ClaimButton } from "./_components/claim-button";

export const metadata: Metadata = {
  title: "Lead Inbox",
};

const headCellClass =
  "px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary whitespace-nowrap";
const bodyCellClass =
  "h-16 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] text-text-primary";

export default async function LeadInboxPage() {
  const user = await getCurrentUser();
  const canClaim = user?.role === "sales" || user?.role === "admin";
  const leads = await getInboxLeads();

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-col-reverse items-start justify-between gap-3 px-2 sm:flex-row sm:items-center lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Lead Inbox</h1>
        <Breadcrumbs
          dividerType="chevron"
          items={[
            { href: "/crm/lead-inbox", label: "CRM" },
            { href: "/crm/lead-inbox", label: "Lead Inbox" },
          ]}
        />
      </div>

      <div className="px-2 lg:px-5">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className={headCellClass}>Tên khách</TableHead>
                  <TableHead className={headCellClass}>SĐT</TableHead>
                  <TableHead className={headCellClass}>Nguồn</TableHead>
                  <TableHead className={headCellClass}>Ghi chú</TableHead>
                  <TableHead className={headCellClass}>Thời gian</TableHead>
                  {canClaim && <TableHead className={headCellClass}>Hành động</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="px-6 py-10 text-center text-sm text-text-secondary"
                      colSpan={canClaim ? 6 : 5}
                    >
                      Chưa có lead mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} className="[&_td]:border-none">
                      <TableCell className={bodyCellClass}>{lead.name}</TableCell>
                      <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                        {lead.phone}
                      </TableCell>
                      <TableCell className={bodyCellClass}>
                        <LeadSourceBadge source={lead.source} />
                      </TableCell>
                      <TableCell className={`${bodyCellClass} max-w-80 truncate`}>
                        {lead.note ?? "—"}
                      </TableCell>
                      <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                        {formatDateTime(lead.createdAt)}
                      </TableCell>
                      {canClaim && (
                        <TableCell className={bodyCellClass}>
                          <ClaimButton leadId={lead.id} />
                        </TableCell>
                      )}
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
