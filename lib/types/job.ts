import { Brand } from "@/lib/types/common";
import { Constants, Enums } from "@/lib/types/supabase";
import { z } from "zod";

export type JobId = Brand<string, "JobId">;
export type UserId = Brand<string, "UserId">;

export type JobStatus = Enums<"job_status">;
export type JobPlatform = Enums<"job_platform">;

export type JobPost = {
  id: JobId;
  platform: JobPlatform;
  title: string;
  companyName: string;
  url: string;
  status: JobStatus;
  appliedDate?: string;
  memo?: string;
};

export const MANUAL_JOB_DEFAULTS = {
  platform: "MANUAL",
  title: "제목 없는 공고",
  companyName: "회사명 미입력",
  url: "",
  status: "APPLIED",
} satisfies Pick<JobPost, "platform" | "title" | "companyName" | "url" | "status">;

export const jobStatusSchema = z.enum(Constants.public.Enums.job_status);

export const jobPlatformSchema = z.enum(Constants.public.Enums.job_platform);

export const partialJobPostSchema = z
  .object({
    id: z.uuid().optional(),
    platform: jobPlatformSchema.optional(),
    title: z.string().min(1).optional(),
    companyName: z.string().min(1).optional(),
    url: z.string().optional(),
    status: jobStatusSchema.optional(),
    appliedDate: z.string().optional(),
    memo: z.string().optional(),
  })
  .strict();
