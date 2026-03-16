import { createClient } from "@/lib/supabase/server";

const AUTH_ERROR_CODE = "28000";

export type QueryErrorLike = {
  code?: string;
  details?: null | string;
  hint?: null | string;
  message: string;
};

type VerifyResult =
  | {
      code: "AUTH_REQUIRED" | "NOT_FOUND" | "QUERY_ERROR";
      ok: false;
      reason: string;
    }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
    };

export function normalizeQueryError(error: QueryErrorLike): string {
  const metadata = [error.details, error.hint].filter(Boolean).join(" | ");

  if (metadata.length > 0) {
    return `${error.message} (${metadata})`;
  }

  return error.message;
}

/**
 * 인증 및 application 소유권을 검증하고, 성공 시 supabase 클라이언트를 반환합니다.
 * 실패 시 에러 코드와 사유를 반환합니다.
 */
export async function verifyApplicationOwnership(
  applicationId: string,
): Promise<VerifyResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: "로그인이 필요합니다.",
    };
  }

  const { data: applicationData, error: applicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", authData.user.id)
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

  return { ok: true, supabase };
}
