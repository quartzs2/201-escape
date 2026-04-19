import { getApplications } from "@/lib/actions";

import { parseApplicationsRouteState } from "../_utils/route-state";
import { AddJobTrigger } from "./add-job";
import { ApplicationFilters } from "./components/ApplicationFilters";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import { getPeriodDateRange, PAGE_SIZE } from "./constants";

type SearchParams = Record<string, string | string[] | undefined>;

export async function ApplicationsView({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { period, previewApplicationId, search, sort, tab } =
    parseApplicationsRouteState(searchParams);
  const dateRange = getPeriodDateRange(period);
  const panelKey = JSON.stringify({ period, search, sort });
  const initialPageResult = await getApplications({
    limit: PAGE_SIZE,
    offset: 0,
    periodEnd: dateRange?.end,
    periodStart: dateRange?.start,
    search: search || undefined,
    sort,
  });

  if (!initialPageResult.ok) {
    throw new Error(initialPageResult.reason);
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-6 pb-10 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-12">
        <section className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-background">
          <ApplicationFilters
            period={period}
            search={search}
            sort={sort}
            tab={tab}
          />
          <ApplicationsPanel
            initialPage={initialPageResult.data}
            key={panelKey}
            period={period}
            previewApplicationId={previewApplicationId}
            search={search}
            sort={sort}
            tab={tab}
          />
        </section>
      </div>
      <AddJobTrigger />
    </main>
  );
}
