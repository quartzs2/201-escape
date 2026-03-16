"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applicationDetailSchema,
  applicationIdSchema,
  type GetApplicationDetailResult,
} from "@/lib/types/application";

import { AUTH_ERROR_CODE, normalizeQueryError } from "./_queryError";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
  INVALID_RESPONSE: "지원 상세 응답을 해석하지 못했습니다.",
  NOT_FOUND: "지원 상세 정보를 찾을 수 없습니다.",
  VALIDATION_ERROR: "유효하지 않은 applicationId입니다.",
} as const;

export async function getApplicationDetail(
  applicationId: string,
): Promise<GetApplicationDetailResult> {
  const parsedApplicationId = applicationIdSchema.safeParse(applicationId);

  if (!parsedApplicationId.success) {
    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        parsedApplicationId.error.issues[0]?.message ??
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
    .select(
      `
        id,
        applied_at,
        notes,
        status,
        jobs (
          company_name,
          description,
          origin_url,
          platform,
          position_title
        )
      `,
    )
    .eq("id", parsedApplicationId.data)
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

  const job = Array.isArray(data.jobs) ? data.jobs[0] : data.jobs;

  if (!job) {
    return {
      code: "UNKNOWN_ERROR",
      ok: false,
      reason: ERROR_MESSAGES.INVALID_RESPONSE,
    };
  }

  const parsedDetail = applicationDetailSchema.safeParse({
    appliedAt: data.applied_at,
    companyName: job.company_name,
    description: job.description,
    id: data.id,
    notes: data.notes,
    originUrl: job.origin_url,
    platform: job.platform,
    positionTitle: job.position_title,
    status: data.status,
  });

  if (!parsedDetail.success) {
    return {
      code: "UNKNOWN_ERROR",
      ok: false,
      reason: ERROR_MESSAGES.INVALID_RESPONSE,
    };
  }

  return {
    data: parsedDetail.data,
    ok: true,
  };
}
