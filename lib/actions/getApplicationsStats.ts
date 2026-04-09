"use server";

import type { GetApplicationsStatsResult } from "@/lib/types/application";

import { DOCS_STATUSES } from "@/lib/constants/application-status";

import { createClient } from "../supabase/server";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
} as const;

/**
 * 사용자의 지원 현황 통계를 반환합니다.
 * 페이지네이션과 무관하게 전체 데이터 기준으로 집계합니다.
 */
export async function getApplicationsStats(): Promise<GetApplicationsStatsResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: ERROR_MESSAGES.AUTH_REQUIRED,
    };
  }

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", userId);

  if (error) {
    const code =
      error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
    const reason = normalizeQueryError(error);
    if (code === "QUERY_ERROR") {
      reportQueryError("getApplicationsStats", reason);
    }
    return { code, ok: false, reason };
  }

  const total = data.length;
  const docs = data.filter((r) =>
    (DOCS_STATUSES as readonly string[]).includes(r.status),
  ).length;
  const interviewing = data.filter((r) => r.status === "INTERVIEWING").length;
  const offered = data.filter((r) => r.status === "OFFERED").length;

  return { data: { docs, interviewing, offered, total }, ok: true };
}
