import { Card, CardContent } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { formatVnd } from "@/lib/format";
import type { ReportStats } from "@/server/lead/report";

const headCellClass =
  "px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary whitespace-nowrap";
const bodyCellClass =
  "h-14 px-6 py-3 text-sm leading-5 font-normal tracking-[-0.15px] text-text-primary";

export function SalesPerformanceTable({ rows }: { rows: ReportStats["salesPerformance"] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Kết quả theo nhân viên</h3>
      </div>
      <CardContent className="p-0">
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            <TableRow className="bg-background-gray-secondary_alt">
              <TableHead className={headCellClass}>Nhân viên</TableHead>
              <TableHead className={`${headCellClass} text-right`}>Lead</TableHead>
              <TableHead className={`${headCellClass} text-right`}>Công trình</TableHead>
              <TableHead className={`${headCellClass} text-right`}>Hoàn thành</TableHead>
              <TableHead className={`${headCellClass} text-right`}>Tỷ lệ chốt</TableHead>
              <TableHead className={`${headCellClass} text-right`}>Doanh thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-6 py-10 text-center text-sm text-text-secondary"
                  colSpan={6}
                >
                  Chưa có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} className="[&_td]:border-none">
                  <TableCell className={`${bodyCellClass} font-medium`}>{r.name}</TableCell>
                  <TableCell className={`${bodyCellClass} text-right`}>{r.leads}</TableCell>
                  <TableCell className={`${bodyCellClass} text-right`}>{r.projects}</TableCell>
                  <TableCell className={`${bodyCellClass} text-right`}>{r.completed}</TableCell>
                  <TableCell className={`${bodyCellClass} text-right`}>{r.conversion}%</TableCell>
                  <TableCell className={`${bodyCellClass} text-right whitespace-nowrap font-medium`}>
                    {formatVnd(r.revenue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </CardContent>
    </Card>
  );
}
