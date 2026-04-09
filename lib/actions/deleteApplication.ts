"use server";

import { z } from "zod";

import {
  type DeleteApplicationInput,
  deleteApplicationInputSchema,
  type DeleteApplicationResult,
} from "@/lib/types/application";

import { normalizeQueryError } from "./_queryError";
import { reportQueryError } from "./_reportQueryError";
import { verifyApplicationOwnership } from "./_verifyApplicationOwnership";

export async function deleteApplication(
  input: DeleteApplicationInput,
): Promise<DeleteApplicationResult> {
  const parsedInput = deleteApplicationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const flattened = z.flattenError(parsedInput.error);

    return {
      code: "VALIDATION_ERROR",
      ok: false,
      reason:
        flattened.formErrors[0] ??
        parsedInput.error.issues[0]?.message ??
        "유효하지 않은 지원 삭제 입력입니다.",
    };
  }

  const ownership = await verifyApplicationOwnership(
    parsedInput.data.applicationId,
  );

  if (!ownership.ok) {
    return ownership;
  }

  const { supabase } = ownership;

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", parsedInput.data.applicationId);

  if (error) {
    const reason = normalizeQueryError(error);
    reportQueryError("deleteApplication", reason);
    return { code: "QUERY_ERROR", ok: false, reason };
  }

  return { ok: true };
}
