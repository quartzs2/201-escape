"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  type UpdateApplicationStatusInput,
  updateApplicationStatusInputSchema,
  type UpdateApplicationStatusResult,
} from "@/lib/types/application";

const AUTH_ERROR_CODE = "28000";
const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
  NOT_FOUND: "상태를 변경할 지원 정보를 찾을 수 없습니다.",
  VALIDATION_ERROR: "유효하지 않은 지원상태 변경 입력입니다.",
} as const;

type QueryErrorLike = {
  code?: string;
  details?: null | string;
  hint?: null | string;
  message: string;
};

export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput,
): Promise<UpdateApplicationStatusResult> {
  const parsedInput = updateApplicationStatusInputSchema.safeParse(input);

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

  const { data, error } = await supabase
    .from("applications")
    .update({
      status: parsedInput.data.status,
    })
    .eq("id", parsedInput.data.applicationId)
    .eq("user_id", authData.user.id)
    .select("id")
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
