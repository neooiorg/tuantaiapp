"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Dialog, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { formatDate, formatVnd } from "@/lib/format";
import type { QuoteStatus } from "@/lib/lead-status";
import type { QuoteReportRow } from "@/server/lead/report";

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Nháp",
  sent: "Đã gửi",
  accepted: "Chấp nhận",
};

const QUOTE_STATUS_COLOR: Record<QuoteStatus, "gray" | "sky" | "success"> = {
  draft: "gray",
  sent: "sky",
  accepted: "success",
};

const headCellClass =
  "px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary whitespace-nowrap";
const bodyCellClass =
  "h-14 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] text-text-primary";

export function QuotesTable({ rows }: { rows: QuoteReportRow[] }) {
  const [viewing, setViewing] = useState<QuoteReportRow | null>(null);

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
          <h3 className="text-base font-medium text-text-primary">Báo giá của sale</h3>
          <Badge color="gray" size="md">
            {rows.length} báo giá
          </Badge>
        </div>
        <CardContent className="p-0">
          <TableRoot className="w-full rounded-none border-none">
            <TableHeader>
              <TableRow className="bg-background-gray-secondary_alt">
                <TableHead className={headCellClass}>Khách hàng</TableHead>
                <TableHead className={headCellClass}>Sale</TableHead>
                <TableHead className={`${headCellClass} text-right`}>Hạng mục</TableHead>
                <TableHead className={`${headCellClass} text-right`}>Tổng tiền</TableHead>
                <TableHead className={headCellClass}>Trạng thái</TableHead>
                <TableHead className={headCellClass}>Ngày tạo</TableHead>
                <TableHead className={`${headCellClass} text-right`}>Nội dung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="px-6 py-10 text-center text-sm text-text-secondary"
                    colSpan={7}
                  >
                    Chưa có báo giá nào.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((q) => (
                  <TableRow key={q.id} className="[&_td]:border-none">
                    <TableCell className={`${bodyCellClass} font-medium`}>
                      <Link href={`/crm/leads/${q.leadId}`} className="hover:text-brand-600">
                        {q.leadName}
                      </Link>
                      <div className="text-xs font-normal text-text-tertiary">{q.leadPhone}</div>
                    </TableCell>
                    <TableCell className={bodyCellClass}>{q.salesName}</TableCell>
                    <TableCell className={`${bodyCellClass} text-right`}>{q.items.length}</TableCell>
                    <TableCell className={`${bodyCellClass} text-right whitespace-nowrap font-medium`}>
                      {formatVnd(q.total)}
                    </TableCell>
                    <TableCell className={bodyCellClass}>
                      <Badge color={QUOTE_STATUS_COLOR[q.status]} size="md">
                        {QUOTE_STATUS_LABELS[q.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className={`${bodyCellClass} whitespace-nowrap`}>
                      {formatDate(q.createdAt)}
                    </TableCell>
                    <TableCell className={`${bodyCellClass} text-right`}>
                      <Button
                        variant="primary"
                        appearance="outline"
                        size="sm"
                        onPress={() => setViewing(q)}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </TableRoot>
        </CardContent>
      </Card>

      <Dialog isOpen={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogHeader>
          <DialogTitle>Báo giá — {viewing?.leadName}</DialogTitle>
        </DialogHeader>
        {viewing && (
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
              <span>
                Sale: <span className="text-text-primary">{viewing.salesName}</span>
              </span>
              <span>
                Trạng thái:{" "}
                <Badge color={QUOTE_STATUS_COLOR[viewing.status]} size="md">
                  {QUOTE_STATUS_LABELS[viewing.status]}
                </Badge>
              </span>
              <span>
                Ngày tạo: <span className="text-text-primary">{formatDate(viewing.createdAt)}</span>
              </span>
            </div>

            <TableRoot className="w-full">
              <TableHeader>
                <TableRow className="bg-background-gray-secondary_alt">
                  <TableHead className={headCellClass}>Hạng mục</TableHead>
                  <TableHead className={`${headCellClass} text-right`}>SL</TableHead>
                  <TableHead className={`${headCellClass} text-right`}>Đơn giá</TableHead>
                  <TableHead className={`${headCellClass} text-right`}>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewing.items.map((it, i) => (
                  <TableRow key={i} className="[&_td]:border-none">
                    <TableCell className={bodyCellClass}>{it.name}</TableCell>
                    <TableCell className={`${bodyCellClass} text-right`}>{it.quantity}</TableCell>
                    <TableCell className={`${bodyCellClass} text-right whitespace-nowrap`}>
                      {formatVnd(it.unitPrice)}
                    </TableCell>
                    <TableCell className={`${bodyCellClass} text-right whitespace-nowrap`}>
                      {formatVnd(it.quantity * it.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>

            <div className="flex justify-between border-t border-card-border pt-3 text-sm font-medium text-text-primary">
              <span>Tổng cộng</span>
              <span>{formatVnd(viewing.total)}</span>
            </div>

            {viewing.note && (
              <div className="text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Ghi chú: </span>
                {viewing.note}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
