import { z } from "zod";

import { applicationIdSchema } from "@/lib/types/application";
import { Constants, Enums } from "@/lib/types/supabase";

export type InterviewType = Enums<"interview_type">;

export const interviewTypeSchema = z.enum(
  Constants.public.Enums.interview_type,
);

export type InterviewDetail = {
  applicationId: string;
  createdAt: string;
  id: string;
  interviewType: InterviewType;
  isDraft: boolean;
  location: null | string;
  round: number;
  // ISO 8601 datetime string (e.g. "2026-03-16T14:30:00+09:00")
  scheduledAt: string;
  scratchpad: null | string;
  updatedAt: string;
};

const interviewLocationSchema = z
  .string()
  .trim()
  .nullable()
  .transform((value) => {
    if (value === null || value.length === 0) {
      return null;
    }
    return value;
  });

const interviewScratchpadSchema = z
  .string()
  .trim()
  .nullable()
  .transform((value) => {
    if (value === null || value.length === 0) {
      return null;
    }
    return value;
  });

export const upsertInterviewInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    // datetime-local input value (YYYY-MM-DDTHH:mm) or full ISO string
    // Supabase TIMESTAMPTZ accepts both; caller is responsible for valid format.
    interviewType: interviewTypeSchema,
    location: interviewLocationSchema,
    round: z.number().int().min(1),
    scheduledAt: z.string().min(1),
    scratchpad: interviewScratchpadSchema,
  })
  .strict();

export type UpsertInterviewInput = z.infer<typeof upsertInterviewInputSchema>;

export const deleteInterviewInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    interviewId: z.uuid("interviewId must be a valid UUID"),
  })
  .strict();

export type DeleteInterviewErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

// --- Result types ---

export type DeleteInterviewInput = z.infer<typeof deleteInterviewInputSchema>;

export type DeleteInterviewResult =
  | { code: DeleteInterviewErrorCode; ok: false; reason: string }
  | { ok: true };

export type GetInterviewsErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR";

export type GetInterviewsResult =
  | { code: GetInterviewsErrorCode; ok: false; reason: string }
  | { data: InterviewDetail[]; ok: true };

export type UpsertInterviewErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

export type UpsertInterviewResult =
  | { code: UpsertInterviewErrorCode; ok: false; reason: string }
  | { data: InterviewDetail; ok: true };
