import { z } from "zod";

import { Brand } from "@/lib/types/common";
import { Constants, Enums } from "@/lib/types/supabase";

export type JobId = Brand<string, "JobId">;
export type JobPlatform = Enums<"job_platform">;

export type JobPost = {
  appliedDate?: string;
  companyName: string;
  id: JobId;
  memo?: string;
  platform: JobPlatform;
  status: JobStatus;
  title: string;
  url: string;
};
export type JobStatus = Enums<"job_status">;

export type UserId = Brand<string, "UserId">;

export const MANUAL_JOB_DEFAULTS = {
  companyName: "회사명 미입력",
  platform: "MANUAL",
  status: "SAVED",
  title: "제목 없는 공고",
  url: "",
} satisfies Pick<
  JobPost,
  "companyName" | "platform" | "status" | "title" | "url"
>;

export const WANTED_JOB_DEFAULTS = {
  companyName: "회사명 미입력",
  platform: "WANTED",
  status: "SAVED",
  title: "제목 없는 공고",
  url: "",
} satisfies Pick<
  JobPost,
  "companyName" | "platform" | "status" | "title" | "url"
>;

export const SARAMIN_JOB_DEFAULTS = {
  companyName: "회사명 미입력",
  platform: "SARAMIN",
  status: "SAVED",
  title: "제목 없는 공고",
  url: "",
} satisfies Pick<
  JobPost,
  "companyName" | "platform" | "status" | "title" | "url"
>;

export const jobStatusSchema = z.enum(Constants.public.Enums.job_status);

export const jobPlatformSchema = z.enum(Constants.public.Enums.job_platform);

export const partialJobPostSchema = z
  .object({
    appliedDate: z.string().optional(),
    companyName: z.string().min(1).optional(),
    id: z.uuid().optional(),
    memo: z.string().optional(),
    platform: jobPlatformSchema.optional(),
    status: jobStatusSchema.optional(),
    title: z.string().min(1).optional(),
    url: z.string().optional(),
  })
  .strict();
