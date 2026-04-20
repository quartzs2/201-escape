import { Suspense } from "react";

import { parseApplicationsRouteState } from "../_utils/route-state";
import { AddJobTrigger } from "./add-job";
import { ApplicationFilters } from "./components/ApplicationFilters";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import { ApplicationsPanelFallback } from "./components/ApplicationsPanelFallback";

type SearchParams = Record<string, string | string[] | undefined>;

export function ApplicationsView({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { period, previewApplicationId, search, sort, tab } =
    parseApplicationsRouteState(searchParams);
  const panelKey = JSON.stringify({ period, search, sort });

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
          <Suspense fallback={<ApplicationsPanelFallback />} key={panelKey}>
            <ApplicationsPanel
              period={period}
              previewApplicationId={previewApplicationId}
              search={search}
              sort={sort}
              tab={tab}
            />
          </Suspense>
        </section>
      </div>
      <AddJobTrigger />
    </main>
  );
}
