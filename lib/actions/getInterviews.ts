"use server";

import { z } from "zod";

import { applicationIdSchema } from "@/lib/types/application";
import {
  type GetInterviewsResult,
  type InterviewDetail,
} from "@/lib/types/interview";

import { normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";
import { verifyApplicationOwnership } from "./_verifyApplicationOwnership";

export async function getInterviews(
  applicationId: string,
): Promise<GetInterviewsResult> {
  const parsedId = applicationIdSchema.safeParse(applicationId);

  if (!parsedId.success) {
    const flattened = z.flattenError(parsedId.error);

    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        flattened.formErrors[0] ??
        parsedId.error.issues[0]?.message ??
        "유효하지 않은 지원 ID입니다.",
    };
  }

  const ownership = await verifyApplicationOwnership(parsedId.data);

  if (!ownership.ok) {
    return ownership;
  }

  const { supabase } = ownership;

  const { data, error } = await supabase
    .from("interviews")
    .select(
      "application_id, created_at, id, interview_type, is_draft, location, round, scheduled_at, scratchpad, updated_at",
    )
    .eq("application_id", parsedId.data)
    .order("round", { ascending: true });

  if (error) {
    const reason = normalizeQueryError(error);
    reportQueryError("getInterviews", reason);
    return { code: "QUERY_ERROR", ok: false, reason };
  }

  return {
    data: data.map(toInterviewDetail),
    ok: true,
  };
}

function toInterviewDetail(row: {
  application_id: string;
  created_at: string;
  id: string;
  interview_type: InterviewDetail["interviewType"];
  is_draft: boolean;
  location: null | string;
  round: number;
  scheduled_at: string;
  scratchpad: null | string;
  updated_at: string;
}): InterviewDetail {
  return {
    applicationId: row.application_id,
    createdAt: row.created_at,
    id: row.id,
    interviewType: row.interview_type,
    isDraft: row.is_draft,
    location: row.location,
    round: row.round,
    scheduledAt: row.scheduled_at,
    scratchpad: row.scratchpad,
    updatedAt: row.updated_at,
  };
}
