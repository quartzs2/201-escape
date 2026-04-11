"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FunnelStep } from "@/lib/types/application";

import { FUNNEL_CHART_HEIGHT } from "./constants";

type Props = {
  data: FunnelStep[];
};

export function FunnelChart({ data }: Props) {
  return (
    <ResponsiveContainer height={FUNNEL_CHART_HEIGHT} width="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ bottom: 0, left: 0, right: 12, top: 4 }}
      >
        <XAxis
          allowDecimals={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          tickLine={false}
          type="number"
        />
        <YAxis
          axisLine={false}
          dataKey="label"
          tick={{ fill: "var(--color-foreground)", fontSize: 13 }}
          tickLine={false}
          type="category"
          width={72}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            fontSize: 13,
            padding: "10px 12px",
          }}
          cursor={{ fill: "var(--color-muted)" }}
          formatter={(value) => [`${value}건`] as const}
        />
        <Bar
          dataKey="count"
          fill="var(--color-primary)"
          fillOpacity={0.9}
          radius={999}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
