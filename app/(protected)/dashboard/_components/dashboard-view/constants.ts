import { APPLICATION_STATUS_META } from "@/lib/constants/application-status";
import { PLATFORM_LABEL } from "@/lib/constants/job-platform";
import { JobStatus } from "@/lib/types/job";

export const STATUS_META = APPLICATION_STATUS_META;

export { PLATFORM_LABEL };

export const DOCS_STATUSES: JobStatus[] = ["APPLIED", "DOCS_PASSED"];
export const IN_PROGRESS_STATUSES: JobStatus[] = [
  "SAVED",
  "APPLIED",
  "DOCS_PASSED",
  "INTERVIEWING",
];
export const DONE_STATUSES: JobStatus[] = ["OFFERED", "REJECTED"];
