import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { getApplications } from "@/lib/actions";

import { AddJobTrigger } from "./add-job";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import {
  APPLICATIONS_QUERY_KEY,
  getApplicationsNextPageParam,
  PAGE_SIZE,
} from "./constants";

export async function ApplicationsView() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
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
  });

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-1.5 px-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            지원 목록
          </h1>
        </header>

        <div className="h-150 overflow-hidden rounded-3xl border border-border/50 bg-background shadow-sm">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ApplicationsViewSkeleton />}>
              <ApplicationsPanel />
            </Suspense>
          </HydrationBoundary>
        </div>
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
      className="space-y-4 p-6"
      role="status"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton className="h-20 w-full rounded-2xl" key={i} />
      ))}
    </div>
  );
}
