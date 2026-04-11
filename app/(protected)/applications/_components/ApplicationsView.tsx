import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { getApplications } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

import { AddJobTrigger } from "./add-job";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import {
  buildApplicationsQueryKey,
  getApplicationsNextPageParam,
  getPeriodDateRange,
  PAGE_SIZE,
  parsePeriodParam,
  parseSortParam,
  PERIOD_PARAM,
  SEARCH_PARAM,
  SORT_PARAM,
} from "./constants";

type SearchParams = Record<string, string | string[] | undefined>;

export async function ApplicationsView({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = getString(searchParams[SEARCH_PARAM]);
  const period = parsePeriodParam(
    getString(searchParams[PERIOD_PARAM]) || null,
  );
  const sort = parseSortParam(getString(searchParams[SORT_PARAM]) || null);
  const dateRange = getPeriodDateRange(period);
  const dateLabel = formatKoreanDate(new Date());

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    getNextPageParam: getApplicationsNextPageParam,
    initialPageParam: 0,
    pages: 1,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const result = await getApplications({
        limit: PAGE_SIZE,
        offset: pageParam,
        periodEnd: dateRange?.end,
        periodStart: dateRange?.start,
        search: search || undefined,
        sort,
      });

      if (!result.ok) {
        throw new Error(result.reason);
      }

      return result.data;
    },
    queryKey: buildApplicationsQueryKey({ period, search, sort }),
  });

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-0 pb-10 sm:px-6 lg:gap-20 lg:px-8 lg:pb-12">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ApplicationsViewSkeleton />}>
            <ApplicationsPanel dateLabel={dateLabel} />
          </Suspense>
        </HydrationBoundary>
      </div>
      <AddJobTrigger />
    </main>
  );
}

function ApplicationsViewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="지원 목록을 불러오는 중입니다"
      role="status"
    >
      <section className="overflow-hidden rounded-3xl bg-muted/30">
        <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)] lg:items-end">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
              <Skeleton className="h-5 w-5/6 max-w-xl rounded-full" />
              <Skeleton className="h-5 w-full max-w-lg rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div className="rounded-2xl bg-background/70 px-4 py-4" key={i}>
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="mt-2 h-8 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-background">
        <div className="space-y-4 border-b border-border/70 px-5 py-5 sm:px-6">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-18 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-22 rounded-full" />
          </div>
        </div>
        <div className="space-y-1 px-4 pb-6 sm:px-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-26 w-full rounded-2xl" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function getString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
