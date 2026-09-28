"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { ReportStats } from "@/server/lead/report";

export function ProjectsChart({ data }: { data: ReportStats["byMonth"] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Số công trình theo tháng</h3>
        <p className="text-xs text-text-tertiary">Công trình chốt cọc, {data.length} tháng gần đây</p>
      </div>
      <div className="p-6">
        <div className="h-72 w-full">
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={{ fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Bar
                dataKey="projects"
                fill="var(--color-primary-500)"
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
