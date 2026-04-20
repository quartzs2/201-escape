"use server";

import { unstable_cache } from "next/cache";

import type {
  ApplicationListItem,
  GetApplicationsResult,
} from "@/lib/types/application";

import { createClientWithToken } from "../supabase/server";
import { getAuthContext } from "./_authContext";
import { getApplicationsCacheTags } from "./_cacheTags";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

type ApplicationsPage = {
  hasMore: boolean;
  items: ApplicationListItem[];
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

      const { data, error } = await query;

      if (error) {
        const reason = normalizeQueryError(error);
        if (error.code !== AUTH_ERROR_CODE) {
          reportQueryError("getApplications", reason);
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

      return { hasMore, items: pageItems };
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
