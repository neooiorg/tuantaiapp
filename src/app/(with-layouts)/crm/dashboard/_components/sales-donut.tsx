"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import { Card } from "@/components/tailgrids/core/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/tailgrids/core/chart";
import type { DashboardStats } from "@/server/lead/dashboard";

const COLORS = [
  "var(--color-primary-500)",
  "var(--color-brand-400)",
  "var(--color-primary-300)",
  "var(--color-brand-600)",
  "var(--color-primary-700)",
  "var(--color-brand-300)",
];

export function SalesDonut({ data }: { data: DashboardStats["bySales"] }) {
  const segments = data.map((s) => ({ name: s.name, value: s.count }));
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card className="p-0">
      <div className="border-b border-card-border px-6 py-4">
        <h3 className="text-base font-medium text-text-primary">Lead theo nhân viên</h3>
      </div>
      <div className="p-6">
        <div className="flex h-90 flex-col items-center justify-between">
          {total === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-text-tertiary">
              Chưa có lead nào.
            </div>
          ) : (
            <>
              <div className="relative flex w-full flex-1 items-center justify-center">
                <ChartContainer className="h-full w-full" height="100%" width="100%" aspect={undefined}>
                  <PieChart>
                    <ChartTooltip
                      cursor={{ fill: "transparent" }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {segments.map((s, i) => (
                        <Cell key={s.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  dy="-0.3em"
                                  className="fill-text-primary text-[20px] font-semibold tracking-[-0.2px]"
                                >
                                  {total}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  dy="1.4em"
                                  className="fill-text-tertiary text-sm font-normal tracking-[-0.15px]"
                                >
                                  Tổng lead
                                </tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              <div className="flex w-full flex-wrap justify-center gap-x-5 gap-y-2 pt-4">
                {segments.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-xs"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-text-secondary">
                      {s.name} ({s.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
