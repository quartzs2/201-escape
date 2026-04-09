import type {
  ApplicationDetail,
  GetApplicationDetailResult,
} from "@/lib/types/application";

import { formatAppliedAt } from "@/lib/utils";

export { formatAppliedAt };

const EMPTY_DESCRIPTION = "공고 설명이 없습니다";
const EMPTY_NOTES = "개인 메모가 없습니다";

export type PreviewTextMeta = {
  isEmpty: boolean;
  text: string;
};

export function getDescriptionMeta(
  detail: ApplicationDetail | null,
): PreviewTextMeta {
  return getTextMeta(detail?.description, EMPTY_DESCRIPTION);
}

export function getErrorSummary(
  result: Extract<GetApplicationDetailResult, { ok: false }>,
) {
  switch (result.code) {
    case "AUTH_REQUIRED": {
      return "로그인이 필요합니다.";
    }
    case "NOT_FOUND": {
      return "지원 기록을 찾을 수 없습니다.";
    }
    default: {
      return "지원 정보를 불러오지 못했습니다.";
    }
  }
}

export function getNotesMeta(
  detail: ApplicationDetail | null,
): PreviewTextMeta {
  return getTextMeta(detail?.notes, EMPTY_NOTES);
}

function getTextMeta(
  text: null | string | undefined,
  emptyPlaceholder: string,
): PreviewTextMeta {
  const trimmed = text?.trim();
  return {
    isEmpty: !trimmed,
    text: trimmed || emptyPlaceholder,
  };
}
