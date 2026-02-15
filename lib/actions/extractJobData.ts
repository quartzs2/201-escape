"use server";

import { AdapterFactory } from "@/lib/adapters/AdapterFactory";
import { JobPost } from "@/lib/types/job";
import { validateSafeUrl } from "@/lib/adapters/utils/url-validator";

const UNKNOWN_ERROR_MESSAGE = "Unknown error";

export type ExtractJobDataResult =
  | { ok: true; data: JobPost }
  | { ok: false; reason: string };

export async function extractJobData(url: string): Promise<ExtractJobDataResult> {
  const validatedUrlResult = validateSafeUrl(url);
  if (!validatedUrlResult.ok) {
    return validatedUrlResult;
  }

  try {
    const data = await AdapterFactory.extractFromUrl(validatedUrlResult.value.toString());
    return {
      ok: true,
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return {
      ok: false,
      reason: `Failed to extract job data: ${message}`,
    };
  }
}
