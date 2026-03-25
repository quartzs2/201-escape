import type { JobStatus } from "@/lib/types/job";

export const APPLICATION_STATUS_ORDER = [
  "SAVED",
  "APPLIED",
  "DOCS_PASSED",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
] as const satisfies readonly JobStatus[];

export const DOCS_STATUSES = [
  "APPLIED",
  "DOCS_PASSED",
] as const satisfies readonly JobStatus[];

export const APPLICATION_STATUS_META: Record<
  JobStatus,
  { color: string; label: string }
> = {
  APPLIED: { color: "text-primary", label: "서류 제출" },
  DOCS_PASSED: { color: "text-blue-700", label: "서류 통과" },
  INTERVIEWING: { color: "text-amber-700", label: "면접 중" },
  OFFERED: { color: "text-emerald-700", label: "최종 합격" },
  REJECTED: { color: "text-muted-foreground", label: "불합격" },
  SAVED: { color: "text-slate-500", label: "관심 공고" },
};
