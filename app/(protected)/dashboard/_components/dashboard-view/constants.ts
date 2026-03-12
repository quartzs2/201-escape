import { JobPlatform, JobStatus } from "@/lib/types/job";

export const STATUS_META: Record<JobStatus, { color: string; label: string }> =
  {
    APPLIED: { color: "text-primary", label: "서류 제출" },
    DOCS_PASSED: { color: "text-blue-700", label: "서류 통과" },
    INTERVIEWING: { color: "text-amber-700", label: "면접 중" },
    OFFERED: { color: "text-emerald-700", label: "최종 합격" },
    REJECTED: { color: "text-muted-foreground", label: "불합격" },
    SAVED: { color: "text-slate-500", label: "관심 공고" },
  };

export const PLATFORM_LABEL: Record<JobPlatform, string> = {
  LINKEDIN: "LinkedIn",
  MANUAL: "직접 입력",
  SARAMIN: "사람인",
  WANTED: "원티드",
};

export const DOCS_STATUSES: JobStatus[] = ["APPLIED", "DOCS_PASSED"];
export const IN_PROGRESS_STATUSES: JobStatus[] = [
  "SAVED",
  "APPLIED",
  "DOCS_PASSED",
  "INTERVIEWING",
];
export const DONE_STATUSES: JobStatus[] = ["OFFERED", "REJECTED"];
