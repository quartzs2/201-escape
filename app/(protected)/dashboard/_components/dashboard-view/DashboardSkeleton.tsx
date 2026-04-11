import { Skeleton } from "@/components/ui";

import { FUNNEL_CHART_HEIGHT, MONTHLY_CHART_HEIGHT } from "./constants";

export function ChartsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="차트를 불러오는 중입니다"
      className="space-y-16 lg:space-y-20"
    >
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:gap-12">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <Skeleton
            className="mt-8 w-full"
            style={{ height: MONTHLY_CHART_HEIGHT }}
          />
        </div>
        <div className="rounded-3xl border border-border/70 bg-muted/55 p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-7 w-40" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-8 h-16 w-full" />
          <Skeleton className="mt-4 h-16 w-full" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-8 w-44" />
          <Skeleton className="mt-3 h-4 w-full max-w-sm" />
          <Skeleton
            className="mt-8 w-full"
            style={{ height: FUNNEL_CHART_HEIGHT }}
          />
        </div>
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-7 w-72" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="mt-5 space-y-2" key={index}>
              <div className="flex justify-between gap-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-14" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <section aria-busy="true" aria-label="통계를 불러오는 중입니다">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:gap-12">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-14 w-32" />
          <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-3xl bg-muted/45 px-5 py-5" key={index}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-4 h-8 w-14" />
                <Skeleton className="mt-3 h-3 w-20" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-muted/55 p-5">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="mt-5 space-y-2" key={index}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
