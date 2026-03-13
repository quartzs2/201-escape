import type {
  ApplicationDetail,
  GetApplicationDetailResult,
} from "@/lib/types/application";

import { formatKoreanDate } from "@/lib/utils";

const DEFAULT_MAX_LENGTH = 160;
const EMPTY_DESCRIPTION = "공고 설명이 없습니다";
const EMPTY_NOTES = "개인 메모가 없습니다";

export type PreviewTextMeta = {
  isEmpty: boolean;
  text: string;
};

export function formatPreviewAppliedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatKoreanDate(date, { includeDayName: false });
}

export function getDescriptionMeta(
  detail: ApplicationDetail | null,
): PreviewTextMeta {
  return {
    isEmpty: !detail?.description?.trim(),
    text: getPreviewText(detail?.description ?? null, EMPTY_DESCRIPTION),
  };
}

export function getErrorSummary(
  result: Extract<GetApplicationDetailResult, { ok: false }>,
) {
  switch (result.code) {
    case "AUTH_REQUIRED": {
      return "로그인이 필요한 공고입니다.";
    }
    case "NOT_FOUND": {
      return "공고 상세를 찾을 수 없습니다.";
    }
    default: {
      return "공고 정보를 불러오지 못했습니다.";
    }
  }
}

export function getNotesMeta(
  detail: ApplicationDetail | null,
): PreviewTextMeta {
  return {
    isEmpty: !detail?.notes?.trim(),
    text: getPreviewText(detail?.notes ?? null, EMPTY_NOTES, 120),
  };
}

export function getPreviewText(
  value: null | string,
  emptyText: string,
  maxLength = DEFAULT_MAX_LENGTH,
) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return emptyText;
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength).trimEnd()}...`;
}
