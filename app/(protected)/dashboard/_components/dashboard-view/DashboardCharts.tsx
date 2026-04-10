"use client";

import dynamic from "next/dynamic";

import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import { Skeleton } from "@/components/ui";

import { FUNNEL_CHART_HEIGHT, MONTHLY_CHART_HEIGHT } from "./constants";

const FunnelChart = dynamic(
  () => import("./FunnelChart").then((m) => ({ default: m.FunnelChart })),
  {
    loading: () => (
      <Skeleton className="w-full" style={{ height: FUNNEL_CHART_HEIGHT }} />
    ),
    ssr: false,
  },
);

const MonthlyTrendChart = dynamic(
  () =>
    import("./MonthlyTrendChart").then((m) => ({
      default: m.MonthlyTrendChart,
    })),
  {
    loading: () => (
      <Skeleton className="w-full" style={{ height: MONTHLY_CHART_HEIGHT }} />
    ),
    ssr: false,
  },
);

type Props = {
  funnel: FunnelStep[];
  monthly: MonthlyCount[];
};

export function DashboardCharts({ funnel, monthly }: Props) {
  return (
    <>
      <section className="mb-6 rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          월별 지원 추이
        </h2>
        <MonthlyTrendChart data={monthly} />
      </section>

      <section className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          단계별 현황
        </h2>
        <FunnelChart data={funnel} />
      </section>
    </>
  );
}
