import { describe, expect, it } from "vitest";

import {
  COMMON_POSITION_TITLE_SUGGESTIONS,
  getDefaultPositionTitle,
  normalizePositionTitle,
} from "@/app/(protected)/applications/_components/add-job/_utils/positionTitle";

describe("positionTitle utils", () => {
  it("최근 입력값이 있으면 기본값으로 사용한다", () => {
    expect(getDefaultPositionTitle("  시니어 프론트엔드 엔지니어  ")).toBe(
      "시니어 프론트엔드 엔지니어",
    );
  });

  it("최근 입력값이 없으면 공통 제안값을 기본값으로 사용한다", () => {
    expect(getDefaultPositionTitle("")).toBe(
      COMMON_POSITION_TITLE_SUGGESTIONS[0],
    );
    expect(getDefaultPositionTitle(null)).toBe(
      COMMON_POSITION_TITLE_SUGGESTIONS[0],
    );
  });

  it("포지션 값 정규화 시 양쪽 공백을 제거한다", () => {
    expect(normalizePositionTitle("  프론트엔드 개발자 ")).toBe(
      "프론트엔드 개발자",
    );
    expect(normalizePositionTitle(undefined)).toBe("");
  });
});
