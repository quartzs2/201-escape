"use server";

import { unstable_cache } from "next/cache";

import type {
  ApplicationListItem,
  ApplicationTabCounts,
  GetApplicationsResult,
} from "@/lib/types/application";

import {
  APPLICATION_ACTIVE_STATUSES,
  APPLICATION_DONE_STATUSES,
} from "@/lib/constants/application-status";

import { createClientWithToken } from "../supabase/server";
import { getAuthContext } from "./_authContext";
import { getApplicationsCacheTags } from "./_cacheTags";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

type ApplicationsPage = {
  hasMore: boolean;
  items: ApplicationListItem[];
  tabCounts: ApplicationTabCounts;
};

type ApplicationsQueryParams = {
  limit: number;
  offset: number;
  periodEnd?: string;
  periodStart?: string;
  search?: string;
  sort?: "applied_at_asc" | "applied_at_desc";
};

export async function getApplications(
  params: ApplicationsQueryParams,
): Promise<GetApplicationsResult> {
  const authResult = await getAuthContext();

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  const { accessToken, userId } = authResult;

  // cookies()를 사용하지 않으므로 unstable_cache 안에서 안전하게 실행됩니다.
  const getCachedApplications = unstable_cache(
    async (
      cachedParams: ApplicationsQueryParams,
    ): Promise<ApplicationsPage> => {
      const supabase = createClientWithToken(accessToken);
      const {
        limit,
        offset,
        periodEnd,
        periodStart,
        search,
        sort = "applied_at_desc",
      } = cachedParams;

      let query = supabase
        .from("applications")
        .select(
          "id, applied_at, company_name, platform, position_title, status",
        )
        .eq("user_id", userId)
        .order("applied_at", { ascending: sort === "applied_at_asc" })
        .range(offset, offset + limit);

      if (search) {
        query = query.ilike("company_name", `%${search}%`);
      }
      if (periodStart) {
        query = query.gte("applied_at", periodStart);
      }
      if (periodEnd) {
        query = query.lte("applied_at", periodEnd);
      }

      let countQuery = supabase
        .from("applications")
        .select("status")
        .eq("user_id", userId);

      if (search) {
        countQuery = countQuery.ilike("company_name", `%${search}%`);
      }
      if (periodStart) {
        countQuery = countQuery.gte("applied_at", periodStart);
      }
      if (periodEnd) {
        countQuery = countQuery.lte("applied_at", periodEnd);
      }

      const [itemsResult, countsResult] = await Promise.all([
        query,
        countQuery,
      ]);
      const { data, error } = itemsResult;

      if (error) {
        const reason = normalizeQueryError(error);
        if (error.code !== AUTH_ERROR_CODE) {
          reportQueryError("getApplications", reason);
        }
        throw new Error(reason);
      }

      if (countsResult.error) {
        const reason = normalizeQueryError(countsResult.error);
        if (countsResult.error.code !== AUTH_ERROR_CODE) {
          reportQueryError("getApplications:counts", reason);
        }
        throw new Error(reason);
      }

      const items: ApplicationListItem[] = data.map((row) => ({
        appliedAt: row.applied_at,
        companyName: row.company_name,
        id: row.id,
        platform: row.platform,
        positionTitle: row.position_title,
        status: row.status,
      }));

      // limit + 1개를 요청해 실제로 limit개만 반환하고, 초과분이 있으면 hasMore = true
      const hasMore = items.length > limit;
      const pageItems = hasMore ? items.slice(0, limit) : items;
      const tabCounts = getApplicationTabCounts(countsResult.data ?? []);

      return { hasMore, items: pageItems, tabCounts };
    },
    ["applications-page", userId],
    { revalidate: 60, tags: getApplicationsCacheTags(userId) },
  );

  try {
    const data = await getCachedApplications(params);
    return { data, ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "알 수 없는 오류";
    return { code: "QUERY_ERROR", ok: false, reason };
  }
}

function getApplicationTabCounts(
  rows: Array<{ status: ApplicationListItem["status"] }>,
): ApplicationTabCounts {
  let active = 0;
  let done = 0;

  for (const row of rows) {
    if (APPLICATION_ACTIVE_STATUSES.includes(row.status)) {
      active++;
    }

    if (APPLICATION_DONE_STATUSES.includes(row.status)) {
      done++;
    }
  }

  return {
    active,
    all: rows.length,
    done,
  };
}
