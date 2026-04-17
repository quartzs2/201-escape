export const COMMON_POSITION_TITLE_SUGGESTIONS = [
  "프론트엔드 엔지니어",
  "백엔드 엔지니어",
  "풀스택 개발자",
  "프로덕트 매니저",
  "프로덕트 디자이너",
  "데이터 엔지니어",
  "DevOps 엔지니어",
] as const;

export const LAST_POSITION_TITLE_STORAGE_KEY = "201-escape:last-position-title";

export function getDefaultPositionTitle(lastPositionTitle?: null | string) {
  const normalizedLastPositionTitle = normalizePositionTitle(lastPositionTitle);

  if (normalizedLastPositionTitle) {
    return normalizedLastPositionTitle;
  }

  return COMMON_POSITION_TITLE_SUGGESTIONS[0];
}

export function normalizePositionTitle(value?: null | string) {
  return value?.trim() ?? "";
}
