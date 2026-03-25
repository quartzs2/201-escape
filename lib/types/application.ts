import { z } from "zod";

import { nullableTextSchema } from "@/lib/types/common";
import {
  type JobPlatform,
  jobPlatformSchema,
  type JobStatus,
  jobStatusSchema,
} from "@/lib/types/job";

export const applicationIdSchema = z.uuid("applicationId must be a valid UUID");
const applicationNotesSchema = nullableTextSchema;

export const updateApplicationStatusInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    status: jobStatusSchema,
  })
  .strict();

export const updateApplicationNotesInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    notes: applicationNotesSchema,
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

export const deleteApplicationInputSchema = z
  .object({
    applicationId: applicationIdSchema,
  })
  .strict();

export type ApplicationsStats = {
  docs: number;
  interviewing: number;
  offered: number;
  total: number;
};

export type DeleteApplicationErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

export type DeleteApplicationInput = z.infer<
  typeof deleteApplicationInputSchema
>;

export type DeleteApplicationResult =
  | { code: DeleteApplicationErrorCode; ok: false; reason: string }
  | { ok: true };

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

export type GetApplicationsErrorCode = "AUTH_REQUIRED" | "QUERY_ERROR";

export type GetApplicationsPage = {
  hasMore: boolean;
  items: ApplicationListItem[];
};

export type GetApplicationsResult =
  | { code: GetApplicationsErrorCode; ok: false; reason: string }
  | { data: GetApplicationsPage; ok: true };

export type GetApplicationsStatsErrorCode = "AUTH_REQUIRED" | "QUERY_ERROR";

export type GetApplicationsStatsResult =
  | { code: GetApplicationsStatsErrorCode; ok: false; reason: string }
  | { data: ApplicationsStats; ok: true };

export type UpdateApplicationNotesErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

export type UpdateApplicationNotesInput = z.infer<
  typeof updateApplicationNotesInputSchema
>;

export type UpdateApplicationNotesResult =
  | {
      code: UpdateApplicationNotesErrorCode;
      ok: false;
      reason: string;
    }
  | {
      data: {
        notes: null | string;
      };
      ok: true;
    };

const jobDescriptionSchema = nullableTextSchema;

export const updateJobDescriptionInputSchema = z
  .object({
    applicationId: applicationIdSchema,
    description: jobDescriptionSchema,
  })
  .strict();

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

export type UpdateJobDescriptionErrorCode =
  | "AUTH_REQUIRED"
  | "NOT_FOUND"
  | "QUERY_ERROR"
  | "VALIDATION_ERROR";

export type UpdateJobDescriptionInput = z.infer<
  typeof updateJobDescriptionInputSchema
>;

export type UpdateJobDescriptionResult =
  | {
      code: UpdateJobDescriptionErrorCode;
      ok: false;
      reason: string;
    }
  | {
      data: {
        description: null | string;
      };
      ok: true;
    };
