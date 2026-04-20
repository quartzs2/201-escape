"use server";

import { unstable_cache } from "next/cache";

import type {
  DashboardData,
  GetDashboardDataResult,
  MonthlyCount,
  StatCounts,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import {
  DOCS_PASSED_STATUSES,
  DOCS_STATUSES,
} from "@/lib/constants/application-status";

import { createClient, createClientWithToken } from "../supabase/server";
import { getAuthenticatedUserId } from "./_auth";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
} as const;

type DashboardApplicationRow = {
  applied_at: null | string;
  status: JobStatus;
};

// cookies()를 사용하지 않으므로 unstable_cache 안에서 안전하게 실행됩니다.
const getCachedDashboardData = unstable_cache(
  async (userId: string, accessToken: string): Promise<DashboardData> => {
    const supabase = createClientWithToken(accessToken);

    const { data, error } = await supabase
      .from("applications")
      .select("applied_at, status")
      .eq("user_id", userId);

    if (error) {
      const code =
        error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
      const reason = normalizeQueryError(error);

      if (code === "QUERY_ERROR") {
        reportQueryError("getDashboardData", reason);
      }

      throw new Error(reason);
    }

    return buildDashboardData(data ?? []);
  },
  ["dashboard-data"],
  { revalidate: 60 },
);

export async function getDashboardData(): Promise<GetDashboardDataResult> {
  const supabase = await createClient();
  const authResult = await getAuthenticatedUserId(supabase);

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: ERROR_MESSAGES.AUTH_REQUIRED,
    };
  }

  try {
    const data = await getCachedDashboardData(authResult.userId, accessToken);

    return { data, ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "알 수 없는 오류";

    return { code: "QUERY_ERROR", ok: false, reason };
  }
}

function buildDashboardData(rows: DashboardApplicationRow[]): DashboardData {
  const cutoffStr = getMonthlyCutoffStr();
  const monthlyMap = new Map<string, number>();
  let applied = 0;
  let docs = 0;
  let docsPassed = 0;
  let interviewing = 0;
  let offered = 0;
  let saved = 0;

  for (const row of rows) {
    const { applied_at, status } = row;

    if (status === "SAVED") {
      saved++;
    } else {
      applied++;
    }

    if ((DOCS_STATUSES as readonly string[]).includes(status)) {
      docs++;
    }

    if ((DOCS_PASSED_STATUSES as readonly string[]).includes(status)) {
      docsPassed++;
    }

    if (status === "INTERVIEWING") {
      interviewing++;
    }

    if (status === "OFFERED") {
      offered++;
    }

    if (!applied_at || applied_at < cutoffStr) {
      continue;
    }

    const month = applied_at.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
  }

  const stats: StatCounts = {
    applied,
    docs,
    docsPassed,
    interviewing,
    offered,
    saved,
    total: rows.length,
  };

  const monthly: MonthlyCount[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ count, month }));

  const funnel = [
    { count: applied, label: "지원" },
    { count: docsPassed, label: "서류 통과" },
    { count: interviewing + offered, label: "면접" },
    { count: offered, label: "합격" },
  ];

  return { funnel, monthly, stats };
}

function getMonthlyCutoffStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);

  return d.toISOString().slice(0, 10);
}
