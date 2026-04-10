"use server";

import { unstable_cache } from "next/cache";

import type { GetStatCountsResult, StatCounts } from "@/lib/types/application";

import { DOCS_STATUSES } from "@/lib/constants/application-status";

import { createClient, createClientWithToken } from "../supabase/server";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
} as const;

// cookies()를 사용하지 않으므로 unstable_cache 안에서 안전하게 실행됩니다.
const getCachedStatCounts = unstable_cache(
  async (userId: string, accessToken: string): Promise<StatCounts> => {
    const supabase = createClientWithToken(accessToken);

    const [totalRes, docsRes, interviewingRes, offeredRes] = await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", DOCS_STATUSES),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "INTERVIEWING"),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "OFFERED"),
    ]);

    const firstError =
      totalRes.error ??
      docsRes.error ??
      interviewingRes.error ??
      offeredRes.error;

    if (firstError) {
      const code =
        firstError.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
      const reason = normalizeQueryError(firstError);
      if (code === "QUERY_ERROR") {
        reportQueryError("getStatCounts", reason);
      }
      throw new Error(reason);
    }

    return {
      docs: docsRes.count ?? 0,
      interviewing: interviewingRes.count ?? 0,
      offered: offeredRes.count ?? 0,
      total: totalRes.count ?? 0,
    };
  },
  ["stat-counts"],
  { revalidate: 60 },
);

export async function getStatCounts(): Promise<GetStatCountsResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: ERROR_MESSAGES.AUTH_REQUIRED,
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
    const data = await getCachedStatCounts(authData.user.id, accessToken);
    return { data, ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "알 수 없는 오류";
    return { code: "QUERY_ERROR", ok: false, reason };
  }
}
