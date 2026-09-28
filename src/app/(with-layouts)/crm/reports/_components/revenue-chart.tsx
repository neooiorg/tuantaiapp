"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import { formatVnd } from "@/lib/format";
import type { ReportStats } from "@/server/lead/report";

// Compact VND for the axis, e.g. 12.000.000 → "12tr".
function compactVnd(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

export function RevenueChart({ data }: { data: ReportStats["byMonth"] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Doanh thu theo tháng</h3>
        <p className="text-xs text-text-tertiary">Tiền cọc thực nhận, {data.length} tháng gần đây</p>
      </div>
      <div className="p-6">
        <div className="h-72 w-full">
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={{ fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fontSize: 11 }}
                tickFormatter={compactVnd}
              />
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value) => formatVnd(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-brand-500)"
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
