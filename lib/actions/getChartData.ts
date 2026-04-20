"use server";

import { unstable_cache } from "next/cache";

import type {
  ChartData,
  GetChartDataResult,
  MonthlyCount,
} from "@/lib/types/application";

import {
  DOCS_PASSED_STATUSES,
  INTERVIEW_STATUSES,
} from "@/lib/constants/application-status";

import { createClientWithToken } from "../supabase/server";
import { getAuthContext } from "./_authContext";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

function getMonthCutoff(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

// cookies()를 사용하지 않으므로 unstable_cache 안에서 안전하게 실행됩니다.
const getCachedChartData = unstable_cache(
  async (userId: string, accessToken: string): Promise<ChartData> => {
    const supabase = createClientWithToken(accessToken);

    const [
      appliedRes,
      docsPassedRes,
      interviewingOrOfferedRes,
      offeredRes,
      monthlyRes,
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("status", "SAVED"),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", DOCS_PASSED_STATUSES),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", INTERVIEW_STATUSES),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "OFFERED"),
      supabase
        .from("applications")
        .select("applied_at")
        .eq("user_id", userId)
        .not("applied_at", "is", null)
        .gte("applied_at", getMonthCutoff()),
    ]);

    const firstError =
      appliedRes.error ??
      docsPassedRes.error ??
      interviewingOrOfferedRes.error ??
      offeredRes.error ??
      monthlyRes.error;

    if (firstError) {
      const code =
        firstError.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
      const reason = normalizeQueryError(firstError);
      if (code === "QUERY_ERROR") {
        reportQueryError("getChartData", reason);
      }
      throw new Error(reason);
    }

    const monthlyMap = new Map<string, number>();
    for (const row of monthlyRes.data ?? []) {
      if (row.applied_at) {
        const month = (row.applied_at as string).slice(0, 7);
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
      }
    }

    const monthly: MonthlyCount[] = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ count, month }));

    const funnel = [
      { count: appliedRes.count ?? 0, label: "지원" },
      { count: docsPassedRes.count ?? 0, label: "서류 통과" },
      { count: interviewingOrOfferedRes.count ?? 0, label: "면접" },
      { count: offeredRes.count ?? 0, label: "합격" },
    ];

    return { funnel, monthly };
  },
  ["chart-data"],
  { revalidate: 60 },
);

export async function getChartData(): Promise<GetChartDataResult> {
  const authResult = await getAuthContext();

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  try {
    const data = await getCachedChartData(
      authResult.userId,
      authResult.accessToken,
    );
    return { data, ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "알 수 없는 오류";
    return { code: "QUERY_ERROR", ok: false, reason };
  }
}
