import { z } from "zod";

import {
  type JobPlatform,
  jobPlatformSchema,
  type JobStatus,
  jobStatusSchema,
} from "@/lib/types/job";

export const applicationIdSchema = z.uuid("applicationId must be a valid UUID");

export const updateApplicationStatusInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    status: jobStatusSchema,
  })
  .strict();

export type ApplicationListItem = {
  appliedAt: string;
  companyName: string;
  id: string;
  platform: JobPlatform;
  positionTitle: string;
  status: JobStatus;
};

export const applicationDetailSchema = z
  .object({
    appliedAt: z.string(),
    companyName: z.string(),
    description: z.string().nullable(),
    id: z.uuid(),
    notes: z.string().nullable(),
    originUrl: z.string(),
    platform: jobPlatformSchema,
    positionTitle: z.string(),
    status: jobStatusSchema,
  })
  .strict();

export type ApplicationDetail = {
  appliedAt: string;
  companyName: string;
  description: null | string;
  id: string;
  notes: null | string;
  originUrl: string;
  platform: JobPlatform;
  positionTitle: string;
  status: JobStatus;
};

export type GetApplicationDetailErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "UNKNOWN_ERROR"
  | "VALIDATION_ERROR";

export type GetApplicationDetailResult =
  | {
      code: GetApplicationDetailErrorCode;
      ok: false;
      reason: string;
    }
  | {
      data: ApplicationDetail;
      ok: true;
    };

export type UpdateApplicationStatusErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusInputSchema
>;

export type UpdateApplicationStatusResult =
  | {
      code: UpdateApplicationStatusErrorCode;
      ok: false;
      reason: string;
    }
  | {
      ok: true;
    };
