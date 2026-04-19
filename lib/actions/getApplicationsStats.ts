"use server";

import type { GetApplicationsStatsResult } from "@/lib/types/application";

import {
  DOCS_PASSED_STATUSES,
  DOCS_STATUSES,
} from "@/lib/constants/application-status";

import { createClient } from "../supabase/server";
import { getAuthenticatedUserId } from "./_auth";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

/**
 * 사용자의 지원 현황 통계를 반환합니다.
 * 페이지네이션과 무관하게 전체 데이터 기준으로 집계합니다.
 */
export async function getApplicationsStats(): Promise<GetApplicationsStatsResult> {
  const supabase = await createClient();
  const authResult = await getAuthenticatedUserId(supabase);

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  const userId = authResult.userId;

  const { data, error } = await supabase
    .from("applications")
    .select("applied_at, status")
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

  let docs = 0;
  let interviewing = 0;
  let offered = 0;
  let applied = 0;
  let docsPassed = 0;
  const monthlyMap = new Map<string, number>();

  for (const row of data) {
    const { applied_at, status } = row;
    if (status !== "SAVED") {
      applied++;
    }
    if ((DOCS_STATUSES as readonly string[]).includes(status)) {
      docs++;
    }
    if (status === "INTERVIEWING") {
      interviewing++;
    }
    if (status === "OFFERED") {
      offered++;
    }
    if ((DOCS_PASSED_STATUSES as readonly string[]).includes(status)) {
      docsPassed++;
    }
    if (applied_at) {
      const month = applied_at.slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
    }
  }

  const total = data.length;
  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ count, month }));

  const funnel = [
    { count: applied, label: "지원" },
    { count: docsPassed, label: "서류 통과" },
    { count: interviewing + offered, label: "면접" },
    { count: offered, label: "합격" },
  ];

  return {
    data: { docs, funnel, interviewing, monthly, offered, total },
    ok: true,
  };
}
