"use server";

import { AdapterFactory } from "@/lib/adapters/AdapterFactory";
import { validateSafeUrl } from "@/lib/adapters/utils/url-validator";
import { createClient } from "@/lib/supabase/server";
import { JobPost } from "@/lib/types/job";

const UNKNOWN_ERROR_MESSAGE = "Unknown error";

const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
} as const;

export type ExtractJobDataResult =
  | { data: JobPost; ok: true }
  | { ok: false; reason: string };

export async function extractJobData(
  url: string,
): Promise<ExtractJobDataResult> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { ok: false, reason: ERROR_MESSAGES.AUTH_REQUIRED };
  }

  const validatedUrlResult = await validateSafeUrl(url);
  if (!validatedUrlResult.ok) {
    return validatedUrlResult;
  }

  try {
    const data = await AdapterFactory.extractFromUrl(
      validatedUrlResult.value.toString(),
    );
    return {
      data,
      ok: true,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return {
      ok: false,
      reason: `Failed to extract job data: ${message}`,
    };
  }
}
