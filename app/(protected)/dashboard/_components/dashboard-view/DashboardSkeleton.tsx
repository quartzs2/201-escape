import { Skeleton } from "@/components/ui";

import { FUNNEL_CHART_HEIGHT, MONTHLY_CHART_HEIGHT } from "./constants";

export function ChartsSkeleton() {
  return (
    <div aria-busy="true" aria-label="차트를 불러오는 중입니다">
      <section className="mb-6 rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="w-full" style={{ height: MONTHLY_CHART_HEIGHT }} />
      </section>

      <section className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="w-full" style={{ height: FUNNEL_CHART_HEIGHT }} />
      </section>
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="통계를 불러오는 중입니다"
      className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
          key={i}
        >
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </section>
  );
}
