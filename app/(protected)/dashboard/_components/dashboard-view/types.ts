import type { JobPlatform, JobStatus } from "@/lib/types/job";

export type ApplicationItem = {
  appliedAt: string;
  companyName: string;
  id: string;
  platform: JobPlatform;
  positionTitle: string;
  status: JobStatus;
};
