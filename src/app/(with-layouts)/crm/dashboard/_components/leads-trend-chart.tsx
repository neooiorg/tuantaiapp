"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { DashboardStats } from "@/server/lead/dashboard";

export function LeadsTrendChart({ data }: { data: DashboardStats["leadsPerDay"] }) {
  return (
    <Card className="p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Lead mới (14 ngày gần đây)</h3>
      </div>
      <div className="p-6">
        <div className="h-72 w-full">
          <ChartContainer className="h-full w-full" height="100%" width="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={32} />
              <ChartTooltip cursor={{ fill: "transparent" }} content={<ChartTooltipContent />} />
              <Area
                dataKey="count"
                type="monotone"
                stroke="var(--color-brand-500)"
                strokeWidth={2}
                fill="url(#leadsTrendFill)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}
