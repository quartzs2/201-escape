"use client";

import dynamic from "next/dynamic";

import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import { FUNNEL_CHART_HEIGHT, MONTHLY_CHART_HEIGHT } from "./constants";

type DeferredFunnelChartProps = {
  data: FunnelStep[];
};

type DeferredMonthlyTrendChartProps = {
  data: MonthlyCount[];
};

const FunnelChartClient = dynamic(
  () =>
    import("./FunnelChart").then((mod) => ({
      default: mod.FunnelChart,
    })),
  {
    loading: FunnelChartFallback,
    ssr: false,
  },
);

const MonthlyTrendChartClient = dynamic(
  () =>
    import("./MonthlyTrendChart").then((mod) => ({
      default: mod.MonthlyTrendChart,
    })),
  {
    loading: MonthlyTrendChartFallback,
    ssr: false,
  },
);

export function DeferredFunnelChart({ data }: DeferredFunnelChartProps) {
  return <FunnelChartClient data={data} />;
}

export function DeferredMonthlyTrendChart({
  data,
}: DeferredMonthlyTrendChartProps) {
  return <MonthlyTrendChartClient data={data} />;
}

function FunnelChartFallback() {
  return (
    <Skeleton
      aria-label="단계별 잔존 비율 차트를 불러오는 중입니다"
      className="w-full"
      style={{ height: FUNNEL_CHART_HEIGHT }}
    />
  );
}

function MonthlyTrendChartFallback() {
  return (
    <Skeleton
      aria-label="월별 지원 추이 차트를 불러오는 중입니다"
      className="w-full"
      style={{ height: MONTHLY_CHART_HEIGHT }}
    />
  );
}
