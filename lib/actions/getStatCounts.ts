"use server";

import { unstable_cache } from "next/cache";

import type { GetStatCountsResult, StatCounts } from "@/lib/types/application";

import {
  DOCS_PASSED_STATUSES,
  DOCS_STATUSES,
} from "@/lib/constants/application-status";

import { createClientWithToken } from "../supabase/server";
import { getAuthContext } from "./_authContext";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

// cookies()를 사용하지 않으므로 unstable_cache 안에서 안전하게 실행됩니다.
const getCachedStatCounts = unstable_cache(
  async (userId: string, accessToken: string): Promise<StatCounts> => {
    const supabase = createClientWithToken(accessToken);

    const { data, error } = await supabase
      .from("applications")
      .select("status")
      .eq("user_id", userId);

    if (error) {
      const code =
        error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
      const reason = normalizeQueryError(error);
      if (code === "QUERY_ERROR") {
        reportQueryError("getStatCounts", reason);
      }
      throw new Error(reason);
    }

    let applied = 0;
    let docs = 0;
    let docsPassed = 0;
    let interviewing = 0;
    let offered = 0;
    let saved = 0;

    for (const row of data ?? []) {
      const { status } = row;

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
    }

    return {
      applied,
      docs,
      docsPassed,
      interviewing,
      offered,
      saved,
      total: (data ?? []).length,
    };
  },
  ["stat-counts"],
  { revalidate: 60 },
);

export async function getStatCounts(): Promise<GetStatCountsResult> {
  const authResult = await getAuthContext();

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  try {
    const data = await getCachedStatCounts(
      authResult.userId,
      authResult.accessToken,
    );
    return { data, ok: true };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "알 수 없는 오류";
    return { code: "QUERY_ERROR", ok: false, reason };
  }
}
