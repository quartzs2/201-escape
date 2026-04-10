"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import { ChartsSkeleton } from "./DashboardSkeleton";

const DashboardCharts = dynamic(
  () =>
    import("./DashboardCharts").then((mod) => ({
      default: mod.DashboardCharts,
    })),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  },
);

type DeferredDashboardChartsProps = {
  funnel: FunnelStep[];
  monthly: MonthlyCount[];
};

export function DeferredDashboardCharts({
  funnel,
  monthly,
}: DeferredDashboardChartsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false);

  useEffect(() => {
    if (shouldRenderCharts) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const requestIdle = window.requestIdleCallback;
    let idleId: null | number = null;

    if (requestIdle) {
      idleId = requestIdle(
        () => {
          setShouldRenderCharts(true);
        },
        { timeout: 2000 },
      );
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setShouldRenderCharts(true);
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();

      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [shouldRenderCharts]);

  return (
    <div ref={containerRef}>
      {shouldRenderCharts ? (
        <DashboardCharts funnel={funnel} monthly={monthly} />
      ) : (
        <ChartsSkeleton />
      )}
    </div>
  );
}
