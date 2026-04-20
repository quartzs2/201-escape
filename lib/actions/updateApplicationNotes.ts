"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";
import {
  type UpdateApplicationNotesInput,
  updateApplicationNotesInputSchema,
  type UpdateApplicationNotesResult,
} from "@/lib/types/application";

import { getApplicationsUserCacheTag } from "./_cacheTags";
import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
  NOT_FOUND: "메모를 수정할 지원 정보를 찾을 수 없습니다.",
  VALIDATION_ERROR: "유효하지 않은 지원 메모 수정 입력입니다.",
} as const;

export async function updateApplicationNotes(
  input: UpdateApplicationNotesInput,
): Promise<UpdateApplicationNotesResult> {
  const parsedInput = updateApplicationNotesInputSchema.safeParse(input);

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
      notes: parsedInput.data.notes,
    })
    .eq("id", parsedInput.data.applicationId)
    .eq("user_id", authData.user.id)
    .select("notes")
    .maybeSingle();

  if (error) {
    const code =
      error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "QUERY_ERROR";
    const reason = normalizeQueryError(error);
    if (code === "QUERY_ERROR") {
      reportQueryError("updateApplicationNotes", reason);
    }
    return { code, ok: false, reason };
  }

  if (!data) {
    return {
      code: "NOT_FOUND",
      ok: false,
      reason: ERROR_MESSAGES.NOT_FOUND,
    };
  }

  trackServerEvent(authData.user.id, ANALYTICS_EVENTS.MEMO_SAVED);
  updateTag(getApplicationsUserCacheTag(authData.user.id));

  return {
    data: {
      notes: data.notes,
    },
    ok: true,
  };
}
