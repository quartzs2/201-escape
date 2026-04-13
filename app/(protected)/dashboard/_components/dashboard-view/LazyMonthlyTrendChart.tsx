"use client";

import dynamic from "next/dynamic";

import type { MonthlyCount } from "@/lib/types/application";

import { Skeleton } from "@/components/ui";
import { useIdleMount } from "@/hooks/useIdleMount";

import { MONTHLY_CHART_HEIGHT } from "./constants";

const MonthlyTrendChart = dynamic(
  () =>
    import("./MonthlyTrendChart").then((module) => module.MonthlyTrendChart),
  {
    loading: () => <MonthlyTrendChartFallback />,
    ssr: false,
  },
);

type LazyMonthlyTrendChartProps = {
  data: MonthlyCount[];
};

export function LazyMonthlyTrendChart({ data }: LazyMonthlyTrendChartProps) {
  const shouldMount = useIdleMount({ timeoutMs: 1500 });

  if (!shouldMount) {
    return <MonthlyTrendChartFallback />;
  }

  return <MonthlyTrendChart data={data} />;
}

function MonthlyTrendChartFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="월별 추이 차트를 준비하는 중입니다"
      className="rounded-3xl bg-background/70 px-2 py-3 sm:px-3"
      role="status"
      style={{ height: MONTHLY_CHART_HEIGHT }}
    >
      <div className="grid h-full grid-rows-[1fr_auto] gap-4">
        <Skeleton className="h-full w-full rounded-3xl" />
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-4 w-full rounded-full" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
