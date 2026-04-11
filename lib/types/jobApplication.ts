import { z } from "zod";

import { Constants } from "@/lib/types/supabase";

const optionalTrimmedTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

export const saveJobApplicationInputSchema = z
  .object({
    appliedAt: z.iso.datetime({ offset: true }).optional(),
    companyName: z.string().trim().min(1, "companyName is required"),
    description: optionalTrimmedTextSchema,
    notes: optionalTrimmedTextSchema,
    originUrl: z.url("originUrl must be a valid URL"),
    platform: z.enum(Constants.public.Enums.job_platform),
    positionTitle: z.string().trim().min(1, "positionTitle is required"),
    rawData: z.record(z.string(), z.unknown()).nullable().optional(),
    status: z.enum(Constants.public.Enums.job_status).optional(),
  })
  .strict();

export type SaveJobApplicationInput = z.infer<
  typeof saveJobApplicationInputSchema
>;

export const saveJobApplicationPayloadSchema = z.object({
  applicationId: z.uuid(),
});

export type SaveJobApplicationErrorCode =
  | "AUTH_REQUIRED"
  | "RPC_ERROR"
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR";

export type SaveJobApplicationFieldErrors = Partial<
  Record<keyof SaveJobApplicationInput, string[]>
>;

export type SaveJobApplicationPayload = z.infer<
  typeof saveJobApplicationPayloadSchema
>;

export type SaveJobApplicationResult =
  | {
      code: SaveJobApplicationErrorCode;
      fieldErrors?: SaveJobApplicationFieldErrors;
      ok: false;
      reason: string;
    }
  | {
      data: SaveJobApplicationPayload;
      ok: true;
    };
