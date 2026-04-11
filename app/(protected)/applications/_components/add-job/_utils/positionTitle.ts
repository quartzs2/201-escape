export const COMMON_POSITION_TITLE_SUGGESTIONS = [
  "프론트엔드 엔지니어",
  "프론트엔드 개발자",
  "웹 프론트엔드 개발자",
  "풀스택 엔지니어",
  "프로덕트 엔지니어",
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
