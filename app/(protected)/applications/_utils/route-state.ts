import type {
  PeriodPreset,
  SortValue,
  TabValue,
} from "../_components/constants";

import {
  parsePeriodParam,
  parseSortParam,
  parseTabParam,
  PERIOD_PARAM,
  PREVIEW_PARAM,
  SEARCH_PARAM,
  SORT_PARAM,
  TAB_PARAM,
} from "../_components/constants";

export type ApplicationsRouteState = {
  period: PeriodPreset;
  previewApplicationId: null | string;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

type SearchParams = Record<string, string | string[] | undefined>;

const APPLICATIONS_PATHNAME = "/applications";

export function buildApplicationsHref({
  period,
  previewApplicationId,
  search,
  sort,
  tab,
}: ApplicationsRouteState): string {
  const params = new URLSearchParams();

  if (search !== "") {
    params.set(SEARCH_PARAM, search);
  }

  if (period !== "all") {
    params.set(PERIOD_PARAM, period);
  }

  if (sort !== "applied_at_desc") {
    params.set(SORT_PARAM, sort);
  }

  if (tab !== "all") {
    params.set(TAB_PARAM, tab);
  }

  if (previewApplicationId) {
    params.set(PREVIEW_PARAM, previewApplicationId);
  }

  const query = params.toString();

  return query ? `${APPLICATIONS_PATHNAME}?${query}` : APPLICATIONS_PATHNAME;
}

export function parseApplicationsRouteState(
  searchParams: SearchParams,
): ApplicationsRouteState {
  return {
    period: parsePeriodParam(
      getFirstString(searchParams[PERIOD_PARAM]) || null,
    ),
    previewApplicationId: getFirstString(searchParams[PREVIEW_PARAM]) || null,
    search: getFirstString(searchParams[SEARCH_PARAM]),
    sort: parseSortParam(getFirstString(searchParams[SORT_PARAM]) || null),
    tab: parseTabParam(getFirstString(searchParams[TAB_PARAM]) || null),
  };
}

function getFirstString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
