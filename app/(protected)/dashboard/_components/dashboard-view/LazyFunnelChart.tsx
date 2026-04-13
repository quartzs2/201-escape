"use client";

import dynamic from "next/dynamic";

import type { FunnelStep } from "@/lib/types/application";

import { Skeleton } from "@/components/ui";
import { useIdleMount } from "@/hooks/useIdleMount";

import { FUNNEL_CHART_HEIGHT } from "./constants";

const FunnelChart = dynamic(
  () => import("./FunnelChart").then((module) => module.FunnelChart),
  {
    loading: () => <FunnelChartFallback />,
    ssr: false,
  },
);

type LazyFunnelChartProps = {
  data: FunnelStep[];
};

export function LazyFunnelChart({ data }: LazyFunnelChartProps) {
  const shouldMount = useIdleMount({ timeoutMs: 1500 });

  if (!shouldMount) {
    return <FunnelChartFallback />;
  }

  return <FunnelChart data={data} />;
}

function FunnelChartFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="단계별 전환 차트를 준비하는 중입니다"
      className="space-y-4 rounded-3xl bg-background/70 px-4 py-4"
      role="status"
      style={{ minHeight: FUNNEL_CHART_HEIGHT }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="grid grid-cols-[72px_1fr] items-center gap-4"
          key={index}
        >
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
