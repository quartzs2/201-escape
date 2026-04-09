"use server";

import type {
  ApplicationListItem,
  GetApplicationsResult,
} from "@/lib/types/application";

import { createClient } from "../supabase/server";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
} as const;

export async function getApplications({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<GetApplicationsResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: ERROR_MESSAGES.AUTH_REQUIRED,
    };
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      applied_at,
      status,
      jobs (
        company_name,
        position_title,
        platform
      )
    `,
    )
    .eq("user_id", authData.user.id)
    .order("applied_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    const code =
      error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
    const reason = normalizeQueryError(error);
    if (code === "QUERY_ERROR") {
      reportQueryError("getApplications", reason);
    }
    return { code, ok: false, reason };
  }

  const items: ApplicationListItem[] = data
    .map((row) => {
      const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;

      if (!job) {
        return null;
      }

      return {
        appliedAt: row.applied_at,
        companyName: job.company_name,
        id: row.id,
        platform: job.platform,
        positionTitle: job.position_title,
        status: row.status,
      };
    })
    .filter((item) => item !== null);

  // limit + 1개를 요청해 실제로 limit개만 반환하고, 초과분이 있으면 hasMore = true
  const hasMore = items.length > limit;
  const pageItems = hasMore ? items.slice(0, limit) : items;

  return { data: { hasMore, items: pageItems }, ok: true };
}
