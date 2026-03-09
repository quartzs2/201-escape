"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  type SaveJobApplicationFieldErrors,
  type SaveJobApplicationInput,
  saveJobApplicationInputSchema,
  saveJobApplicationPayloadSchema,
  type SaveJobApplicationResult,
} from "@/lib/types/jobApplication";

const AUTH_ERROR_CODE = "28000";
const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required.",
  INVALID_RPC_RESPONSE: "Failed to parse save_job_application response.",
  UNKNOWN_ERROR: "Unknown error",
  VALIDATION_ERROR: "Invalid saveJobApplication input.",
} as const;

type RpcErrorLike = {
  code?: string;
  details?: null | string;
  hint?: null | string;
  message: string;
};

export async function saveJobApplication(
  input: SaveJobApplicationInput,
): Promise<SaveJobApplicationResult> {
  const parsedInput = saveJobApplicationInputSchema.safeParse(input);
  if (!parsedInput.success) {
    const flattened = z.flattenError(parsedInput.error);
    const reason =
      flattened.formErrors[0] ??
      parsedInput.error.issues[0]?.message ??
      ERROR_MESSAGES.VALIDATION_ERROR;

    return {
      code: "VALIDATION_ERROR",
      fieldErrors: flattened.fieldErrors as SaveJobApplicationFieldErrors,
      ok: false,
      reason,
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

  const { data, error } = await supabase.rpc("save_job_application", {
    p_applied_at: parsedInput.data.appliedAt ?? null,
    p_company_name: parsedInput.data.companyName,
    p_description: parsedInput.data.description ?? null,
    p_notes: parsedInput.data.notes ?? null,
    p_origin_url: parsedInput.data.originUrl,
    p_platform: parsedInput.data.platform,
    p_position_title: parsedInput.data.positionTitle,
    p_raw_data: parsedInput.data.rawData ?? null,
    p_status: parsedInput.data.status ?? null,
  });

  if (error) {
    return {
      code: error.code === AUTH_ERROR_CODE ? "AUTH_REQUIRED" : "RPC_ERROR",
      ok: false,
      reason: normalizeRpcError(error),
    };
  }

  const payload = Array.isArray(data) ? data[0] : data;
  const parsedPayload = saveJobApplicationPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      code: "UNKNOWN_ERROR",
      ok: false,
      reason: ERROR_MESSAGES.INVALID_RPC_RESPONSE,
    };
  }

  return {
    data: parsedPayload.data,
    ok: true,
  };
}

function normalizeRpcError(error: RpcErrorLike): string {
  const metadata = [error.details, error.hint].filter(Boolean).join(" | ");

  if (metadata.length > 0) {
    return `${error.message} (${metadata})`;
  }

  return error.message;
}
