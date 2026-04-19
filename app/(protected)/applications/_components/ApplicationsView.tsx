import { getApplications } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

import { AddJobTrigger } from "./add-job";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import {
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-0 pb-10 sm:px-6 lg:gap-20 lg:px-8 lg:pb-12">
        <ApplicationsPanel
          dateLabel={dateLabel}
          initialPage={initialPageResult.data}
          key={panelKey}
        />
      </div>
      <AddJobTrigger />
    </main>
  );
}

function getString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
