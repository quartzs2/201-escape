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
 * useInfiniteQuery / prefetchInfiniteQuery 공통 query key
 */
export const APPLICATIONS_QUERY_KEY = ["applications"] as const;

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
