import type { GetApplicationsPage } from "@/lib/types/application";

import { getApplications } from "@/lib/actions/getApplications";

import type { PeriodPreset, SortValue, TabValue } from "../constants";

import { getPeriodDateRange, PAGE_SIZE } from "../constants";
import { ApplicationsPanelClient } from "./ApplicationsPanelClient";

type ApplicationsPanelProps = {
  period: PeriodPreset;
  previewApplicationId: null | string;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

type LoadApplicationsPanelPageParams = {
  periodEnd?: string;
  periodStart?: string;
  search?: string;
  sort?: SortValue;
};

export async function ApplicationsPanel({
  period,
  previewApplicationId,
  search,
  sort,
  tab,
}: ApplicationsPanelProps) {
  const dateRange = getPeriodDateRange(period);
  const initialPage = await loadApplicationsPanelPage({
    periodEnd: dateRange?.end,
    periodStart: dateRange?.start,
    search: search || undefined,
    sort,
  });

  return (
    <div className="flex flex-col">
      <ApplicationsPanelClient
        initialPage={initialPage}
        period={period}
        periodEnd={dateRange?.end}
        periodStart={dateRange?.start}
        previewApplicationId={previewApplicationId}
        search={search}
        sort={sort}
        tab={tab}
      />
    </div>
  );
}

async function loadApplicationsPanelPage({
  periodEnd,
  periodStart,
  search,
  sort,
}: LoadApplicationsPanelPageParams): Promise<GetApplicationsPage> {
  const result = await getApplications({
    limit: PAGE_SIZE,
    offset: 0,
    periodEnd,
    periodStart,
    search,
    sort,
  });

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return result.data;
}
