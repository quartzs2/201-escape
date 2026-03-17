import type { InterviewType } from "@/lib/types/interview";

export const INTERVIEW_TYPE_LABEL: Record<InterviewType, string> = {
  CULTURE: "컬처 면접",
  FINAL: "최종 면접",
  HR: "인사 면접",
  OTHER: "기타",
  TECH: "기술 면접",
};
