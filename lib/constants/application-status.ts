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

export const DOCS_PASSED_STATUSES = [
  "DOCS_PASSED",
  "INTERVIEWING",
  "OFFERED",
] as const satisfies readonly JobStatus[];

export const INTERVIEW_STATUSES = [
  "INTERVIEWING",
  "OFFERED",
] as const satisfies readonly JobStatus[];

export const APPLICATION_STATUS_META: Record<
  JobStatus,
  { badgeClassName: string; color: string; label: string }
> = {
  APPLIED: {
    badgeClassName: "bg-primary/10 text-primary",
    color: "text-primary",
    label: "서류 제출",
  },
  DOCS_PASSED: {
    badgeClassName: "bg-primary/15 text-primary",
    color: "text-primary",
    label: "서류 통과",
  },
  INTERVIEWING: {
    badgeClassName: "bg-primary/20 text-primary",
    color: "text-primary",
    label: "면접 중",
  },
  OFFERED: {
    badgeClassName: "bg-primary/25 text-primary",
    color: "text-primary",
    label: "최종 합격",
  },
  REJECTED: {
    badgeClassName: "bg-muted text-muted-foreground/60",
    color: "text-muted-foreground",
    label: "불합격",
  },
  SAVED: {
    badgeClassName: "bg-muted text-muted-foreground/60",
    color: "text-muted-foreground",
    label: "관심 공고",
  },
};
