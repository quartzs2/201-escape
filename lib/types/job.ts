import { Brand } from "@/lib/types/common";
import { Enums } from "@/lib/types/supabase";

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
