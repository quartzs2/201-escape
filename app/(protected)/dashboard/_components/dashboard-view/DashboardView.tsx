import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { getApplications, getApplicationsStats } from "@/lib/actions";
import { cn, formatKoreanDate } from "@/lib/utils";

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
    <main className="flex h-dvh flex-col">
      <div className="shrink-0 px-5 pt-6 pb-5">
        <p className="text-muted-foreground">{formatKoreanDate(new Date())}</p>
        <h1 className="mt-0.5 text-3xl text-foreground">지원 현황</h1>
      </div>

      <div className="grid shrink-0 grid-cols-4 border-y border-border">
        {stats.map((stat, i) => (
          <div
            className={cn(
              "flex flex-col items-center gap-1 py-5",
              i < stats.length - 1 && "border-r border-border",
            )}
            key={stat.label}
          >
            <span className="text-xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<DashboardViewSkeleton />}>
            <DashboardApplicationsPanel />
          </Suspense>
        </HydrationBoundary>
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
      className="space-y-3 px-5 pt-4"
      role="status"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton className="h-16 w-full rounded-xl" key={i} />
      ))}
    </div>
  );
}
