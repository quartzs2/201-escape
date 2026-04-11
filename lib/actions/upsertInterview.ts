"use server";

import { z } from "zod";

import {
  type InterviewDetail,
  type UpsertInterviewInput,
  upsertInterviewInputSchema,
  type UpsertInterviewResult,
} from "@/lib/types/interview";

import { normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";
import { verifyApplicationOwnership } from "./_verifyApplicationOwnership";

export async function upsertInterview(
  input: UpsertInterviewInput,
): Promise<UpsertInterviewResult> {
  const parsedInput = upsertInterviewInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const flattened = z.flattenError(parsedInput.error);

    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        flattened.formErrors[0] ??
        parsedInput.error.issues[0]?.message ??
        "유효하지 않은 면접 입력입니다.",
    };
  }

  const ownership = await verifyApplicationOwnership(
    parsedInput.data.applicationId,
  );

  if (!ownership.ok) {
    return ownership;
  }

  const { supabase } = ownership;
  const {
    applicationId,
    interviewType,
    location,
    round,
    scheduledAt,
    scratchpad,
  } = parsedInput.data;

  // (application_id, round) UNIQUE 제약을 활용해 upsert합니다.
  // round가 같으면 기존 면접을 수정하고, 없으면 새로 생성합니다.
  const { data, error } = await supabase
    .from("interviews")
    .upsert(
      {
        application_id: applicationId,
        interview_type: interviewType,
        location,
        round,
        scheduled_at: scheduledAt,
        scratchpad,
      },
      { onConflict: "application_id,round" },
    )
    .select(
      "application_id, created_at, id, interview_type, is_draft, location, round, scheduled_at, scratchpad, updated_at",
    )
    .maybeSingle();

  if (error) {
    const reason = normalizeQueryError(error);
    reportQueryError("upsertInterview", reason);
    return { code: "QUERY_ERROR", ok: false, reason };
  }

  if (!data) {
    return {
      code: "NOT_FOUND",
      ok: false,
      reason: "면접 정보를 찾을 수 없습니다.",
    };
  }

  const result: InterviewDetail = {
    applicationId: data.application_id,
    createdAt: data.created_at,
    id: data.id,
    interviewType: data.interview_type,
    isDraft: data.is_draft,
    location: data.location,
    round: data.round,
    scheduledAt: data.scheduled_at,
    scratchpad: data.scratchpad,
    updatedAt: data.updated_at,
  };

  return { data: result, ok: true };
}
