"use server";

import { z } from "zod";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import {
  type DeleteInterviewInput,
  deleteInterviewInputSchema,
  type DeleteInterviewResult,
} from "@/lib/types/interview";

import { normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";
import { verifyApplicationOwnership } from "./_verifyApplicationOwnership";

export async function deleteInterview(
  input: DeleteInterviewInput,
): Promise<DeleteInterviewResult> {
  const parsedInput = deleteInterviewInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const flattened = z.flattenError(parsedInput.error);

    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        flattened.formErrors[0] ??
        parsedInput.error.issues[0]?.message ??
        "유효하지 않은 면접 삭제 입력입니다.",
    };
  }

  const ownership = await verifyApplicationOwnership(
    parsedInput.data.applicationId,
  );

  if (!ownership.ok) {
    return ownership;
  }

  const { supabase, userId } = ownership;

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", parsedInput.data.interviewId)
    .eq("application_id", parsedInput.data.applicationId);

  if (error) {
    const reason = normalizeQueryError(error);
    reportQueryError("deleteInterview", reason);
    return { code: "QUERY_ERROR", ok: false, reason };
  }

  trackServerEvent(userId, ANALYTICS_EVENTS.INTERVIEW_DELETED);

  return { ok: true };
}
