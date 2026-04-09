import type { GetApplicationsPage } from "@/lib/types/application";

import { APPLICATION_STATUS_META } from "@/lib/constants/application-status";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";
import { JobStatus } from "@/lib/types/job";

export const STATUS_META = APPLICATION_STATUS_META;

export { PLATFORM_LABEL };

export { DOCS_STATUSES } from "@/lib/constants/application-status";

export const IN_PROGRESS_STATUSES: JobStatus[] = [
  "SAVED",
  "APPLIED",
  "DOCS_PASSED",
  "INTERVIEWING",
];
export const DONE_STATUSES: JobStatus[] = ["OFFERED", "REJECTED"];

/**
 * 한 페이지에 로드할 지원서 수
 */
export const PAGE_SIZE = 30;

/**
 * URL query string 파라미터 키
 */
export const SEARCH_PARAM = "q";
export const PERIOD_PARAM = "period";
export const TAB_PARAM = "tab";
export const PREVIEW_PARAM = "preview";

/**
 * 기간 프리셋
 */
export const PERIOD_PRESETS = ["all", "this_month", "last_3_months"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  all: "전체",
  last_3_months: "최근 3개월",
  this_month: "이번 달",
};

/**
 * period preset을 날짜 범위(ISO string)로 변환합니다.
 * "all"이면 null을 반환합니다.
 */
export function getPeriodDateRange(
  period: PeriodPreset,
): null | { end: string; start: string } {
  const now = new Date();

  if (period === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    return { end: end.toISOString(), start: start.toISOString() };
  }

  if (period === "last_3_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return { end: now.toISOString(), start: start.toISOString() };
  }

  return null;
}

/**
 * 탭 값
 */
export const TAB_VALUES = ["all", "active", "done"] as const;
export type TabValue = (typeof TAB_VALUES)[number];

/**
 * 정렬 값
 */
export const SORT_PARAM = "sort";
export const SORT_VALUES = ["applied_at_desc", "applied_at_asc"] as const;
export type SortValue = (typeof SORT_VALUES)[number];

export const SORT_LABELS: Record<SortValue, string> = {
  applied_at_asc: "오래된순",
  applied_at_desc: "최신순",
};

/**
 * URL 파라미터를 PeriodPreset으로 파싱합니다.
 * 유효하지 않은 값은 "all"로 폴백합니다.
 */
export function parsePeriodParam(value: null | string): PeriodPreset {
  return (PERIOD_PRESETS as readonly string[]).includes(value ?? "")
    ? (value as PeriodPreset)
    : "all";
}

/**
 * URL 파라미터를 SortValue로 파싱합니다.
 * 유효하지 않은 값은 "applied_at_desc"로 폴백합니다.
 */
export function parseSortParam(value: null | string): SortValue {
  return (SORT_VALUES as readonly string[]).includes(value ?? "")
    ? (value as SortValue)
    : "applied_at_desc";
}

/**
 * URL 파라미터를 TabValue로 파싱합니다.
 * 유효하지 않은 값은 "all"로 폴백합니다.
 */
export function parseTabParam(value: null | string): TabValue {
  return (TAB_VALUES as readonly string[]).includes(value ?? "")
    ? (value as TabValue)
    : "all";
}

/**
 * useInfiniteQuery / prefetchInfiniteQuery 공통 query key 베이스
 */
export const APPLICATIONS_QUERY_KEY = ["applications"] as const;

/**
 * 필터가 포함된 query key를 생성합니다.
 * Panel과 View에서 동일한 key를 사용해 HydrationBoundary가 올바르게 작동합니다.
 */
export function buildApplicationsQueryKey(params: {
  period: PeriodPreset;
  search: string;
  sort: SortValue;
}) {
  return [...APPLICATIONS_QUERY_KEY, params] as const;
}

/**
 * useInfiniteQuery / prefetchInfiniteQuery 공통 getNextPageParam.
 * lastPageParam + 현재 페이지 아이템 수로 다음 오프셋을 O(1)에 계산합니다.
 */
export function getApplicationsNextPageParam(
  lastPage: GetApplicationsPage,
  _allPages: GetApplicationsPage[],
  lastPageParam: number,
): number | undefined {
  return lastPage.hasMore ? lastPageParam + lastPage.items.length : undefined;
}
