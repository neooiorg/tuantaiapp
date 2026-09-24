"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import { formatVnd } from "@/lib/format";

// Dummy monthly revenue — real revenue-over-time is not tracked yet.
const DUMMY_REVENUE = [
  { month: "T4", revenue: 120 },
  { month: "T5", revenue: 180 },
  { month: "T6", revenue: 150 },
  { month: "T7", revenue: 240 },
  { month: "T8", revenue: 200 },
  { month: "T9", revenue: 290 },
];

export function RevenueDummyChart({ depositTotal }: { depositTotal: number }) {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <div>
          <h3 className="text-base font-medium text-text-primary">Doanh thu theo tháng</h3>
          <p className="text-xs text-text-tertiary">
            Tổng tiền cọc thực tế: {formatVnd(depositTotal)}
          </p>
        </div>
        <Badge color="gray" size="md">
          Dữ liệu mẫu
        </Badge>
      </div>
      <div className="p-6">
        <div className="h-72 w-full">
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <BarChart data={DUMMY_REVENUE} margin={{ top: 10, right: 0, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} dy={8} />
              <YAxis axisLine={false} tickLine={false} width={36} />
              <ChartTooltip cursor={{ fill: "transparent" }} content={<ChartTooltipContent hideIndicator />} />
              <Bar
                dataKey="revenue"
                fill="var(--color-background-gray-quaternary)"
                activeBar={{ fill: "var(--color-brand-500)" }}
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}
