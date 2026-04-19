import { createClient } from "@/lib/supabase/server";

import { getAuthenticatedUserId } from "./_auth";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";

type VerifyResult =
  | {
      code: "AUTH_REQUIRED" | "NOT_FOUND" | "QUERY_ERROR";
      ok: false;
      reason: string;
    }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
    };

/**
 * 인증 및 application 소유권을 검증하고, 성공 시 supabase 클라이언트를 반환합니다.
 * 실패 시 에러 코드와 사유를 반환합니다.
 */
export async function verifyApplicationOwnership(
  applicationId: string,
): Promise<VerifyResult> {
  const supabase = await createClient();
  const authResult = await getAuthenticatedUserId(supabase);

  if (!authResult.ok) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: authResult.reason,
    };
  }

  const { data: applicationData, error: applicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", authResult.userId)
    .maybeSingle();

  if (applicationError) {
    return {
      code:
        applicationError.code === AUTH_ERROR_CODE
          ? "AUTH_REQUIRED"
          : "QUERY_ERROR",
      ok: false,
      reason: normalizeQueryError(applicationError),
    };
  }

  if (!applicationData) {
    return {
      code: "NOT_FOUND",
      ok: false,
      reason: "해당 지원 정보를 찾을 수 없습니다.",
    };
  }

  return { ok: true, supabase, userId: authResult.userId };
}
