import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { getApplications, getApplicationsStats } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

import { AddJobTrigger } from "../add-job";
import { DashboardApplicationsPanel } from "./components/DashboardApplicationsPanel";
import {
  APPLICATIONS_QUERY_KEY,
  getApplicationsNextPageParam,
  PAGE_SIZE,
} from "./constants";

export async function DashboardView() {
  const queryClient = new QueryClient();

  const [, statsResult] = await Promise.all([
    queryClient.prefetchInfiniteQuery({
      getNextPageParam: getApplicationsNextPageParam,
      initialPageParam: 0,
      pages: 1,
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const result = await getApplications({
          limit: PAGE_SIZE,
          offset: pageParam,
        });

        if (!result.ok) {
          throw new Error(result.reason);
        }

        return result.data;
      },
      queryKey: APPLICATIONS_QUERY_KEY,
    }),
    getApplicationsStats(),
  ]);

  if (!statsResult.ok) {
    throw new Error(statsResult.reason);
  }

  const { docs, interviewing, offered, total } = statsResult.data;

  const stats = [
    { label: "전체", value: total },
    { label: "서류", value: docs },
    { label: "면접", value: interviewing },
    { label: "합격", value: offered },
  ];

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-1.5 px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {formatKoreanDate(new Date())}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            지원 현황
          </h1>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
              key={stat.label}
            >
              <span className="text-2xl font-black tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        <div className="h-150 overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<DashboardViewSkeleton />}>
              <DashboardApplicationsPanel />
            </Suspense>
          </HydrationBoundary>
        </div>
      </div>
      <AddJobTrigger />
    </main>
  );
}

function DashboardViewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="지원 목록을 불러오는 중입니다"
      className="space-y-4 p-6"
      role="status"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton className="h-20 w-full rounded-2xl" key={i} />
      ))}
    </div>
  );
}
