"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { DashboardStats } from "@/server/lead/dashboard";

export function StatusBarChart({ data }: { data: DashboardStats["statusCounts"] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Lead theo trạng thái</h3>
      </div>
      <div className="p-6">
        <div className="h-90 w-full">
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Bar dataKey="count" fill="var(--color-brand-500)" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}
