"use server";

import { AdapterFactory } from "@/lib/adapters/AdapterFactory";
import { validateSafeUrl } from "@/lib/adapters/utils/url-validator";
import { JobPost } from "@/lib/types/job";

const UNKNOWN_ERROR_MESSAGE = "Unknown error";

export type ExtractJobDataResult =
  | { data: JobPost; ok: true; }
  | { ok: false; reason: string };

export async function extractJobData(url: string): Promise<ExtractJobDataResult> {
  const validatedUrlResult = await validateSafeUrl(url);
  if (!validatedUrlResult.ok) {
    return validatedUrlResult;
  }

  try {
    const data = await AdapterFactory.extractFromUrl(validatedUrlResult.value.toString());
    return {
      data,
      ok: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return {
      ok: false,
      reason: `Failed to extract job data: ${message}`,
    };
  }
}
