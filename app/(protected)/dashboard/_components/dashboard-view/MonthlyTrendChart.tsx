"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyCount } from "@/lib/types/application";

import { formatMonthLabel } from "../../_utils/dashboard";
import { MONTHLY_CHART_HEIGHT } from "./constants";

type Props = {
  data: MonthlyCount[];
};

export function MonthlyTrendChart({ data }: Props) {
  const chartData = data.map((month) => ({
    ...month,
    label: formatMonthLabel(month.month),
  }));

  return (
    <ResponsiveContainer height={MONTHLY_CHART_HEIGHT} width="100%">
      <LineChart
        data={chartData}
        margin={{ bottom: 0, left: -24, right: 12, top: 8 }}
      >
        <CartesianGrid
          stroke="var(--color-border)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            fontSize: 13,
            padding: "10px 12px",
          }}
          formatter={(value) => [`${value}건`, "지원 수"] as const}
          labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
        />
        <Line
          activeDot={{ fill: "var(--color-primary)", r: 5, strokeWidth: 0 }}
          dataKey="count"
          dot={{ fill: "var(--color-primary)", r: 3, strokeWidth: 0 }}
          stroke="var(--color-primary)"
          strokeWidth={3}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
