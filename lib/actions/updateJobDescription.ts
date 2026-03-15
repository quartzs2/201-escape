"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  type UpdateJobDescriptionInput,
  updateJobDescriptionInputSchema,
  type UpdateJobDescriptionResult,
} from "@/lib/types/application";

const AUTH_ERROR_CODE = "28000";
const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
  NOT_FOUND: "공고 설명을 수정할 지원 정보를 찾을 수 없습니다.",
  VALIDATION_ERROR: "유효하지 않은 공고 설명 수정 입력입니다.",
} as const;

type QueryErrorLike = {
  code?: string;
  details?: null | string;
  hint?: null | string;
  message: string;
};

export async function updateJobDescription(
  input: UpdateJobDescriptionInput,
): Promise<UpdateJobDescriptionResult> {
  const parsedInput = updateJobDescriptionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const flattened = z.flattenError(parsedInput.error);

    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        flattened.formErrors[0] ??
        parsedInput.error.issues[0]?.message ??
        ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return {
      code: "AUTH_REQUIRED",
      ok: false,
      reason: ERROR_MESSAGES.AUTH_REQUIRED,
    };
  }

  // application을 통해 job_id를 조회하고, 해당 사용자 소유 여부를 검증합니다.
  const { data: applicationData, error: applicationError } = await supabase
    .from("applications")
    .select("job_id")
    .eq("id", parsedInput.data.applicationId)
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
      reason: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({ description: parsedInput.data.description })
    .eq("id", applicationData.job_id)
    .select("description")
    .maybeSingle();

  if (error) {
    return {
      code: error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR",
      ok: false,
      reason: normalizeQueryError(error),
    };
  }

  if (!data) {
    return {
      code: "NOT_FOUND",
      ok: false,
      reason: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  return {
    data: {
      description: data.description,
    },
    ok: true,
  };
}

function normalizeQueryError(error: QueryErrorLike): string {
  const metadata = [error.details, error.hint].filter(Boolean).join(" | ");

  if (metadata.length > 0) {
    return `${error.message} (${metadata})`;
  }

  return error.message;
}
