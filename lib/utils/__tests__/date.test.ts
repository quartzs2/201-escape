import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatAppliedAt,
  formatKoreanDate,
  formatScheduledAt,
  getTimeAgo,
  toDatetimeLocalValue,
} from "../date";

describe("formatAppliedAt", () => {
  it("유효한 ISO 문자열을 요일 없는 한국어 날짜로 변환한다", () => {
    // UTC 2025-01-15T00:00:00Z -> KST 2025-01-15T09:00:00+09:00
    expect(formatAppliedAt("2025-01-15T00:00:00.000Z")).toBe("2025년 1월 15일");
  });

  it("유효하지 않은 문자열은 원본을 그대로 반환한다", () => {
    expect(formatAppliedAt("not-a-date")).toBe("not-a-date");
  });
});

describe("formatKoreanDate", () => {
  // 2025-01-15 수요일(KST)
  const wednesday = new Date("2025-01-15T00:00:00.000Z");

  it("기본값(includeDayName: true)이면 요일을 포함한다", () => {
    expect(formatKoreanDate(wednesday)).toBe("2025년 1월 15일 수요일");
  });

  it("includeDayName: false이면 요일을 포함하지 않는다", () => {
    expect(formatKoreanDate(wednesday, { includeDayName: false })).toBe(
      "2025년 1월 15일",
    );
  });

  it("UTC 기준이 아닌 KST 기준으로 날짜를 반환한다", () => {
    // UTC 2025-01-14T15:00:00Z -> KST 2025-01-15T00:00:00+09:00(UTC보다 하루 뒤)
    const kstMidnight = new Date("2025-01-14T15:00:00.000Z");
    expect(formatKoreanDate(kstMidnight, { includeDayName: false })).toBe(
      "2025년 1월 15일",
    );
  });
});

describe("formatScheduledAt", () => {
  it("날짜와 시간을 함께 반환한다", () => {
    // UTC 06:00 -> KST 15:00
    expect(formatScheduledAt("2025-01-15T06:00:00.000Z")).toBe(
      "2025년 1월 15일 수요일 15:00",
    );
  });

  it("KST 자정(00:00)을 올바르게 표시한다", () => {
    // UTC 2025-01-15T15:00:00Z -> KST 2025-01-16T00:00:00+09:00(목요일)
    expect(formatScheduledAt("2025-01-15T15:00:00.000Z")).toBe(
      "2025년 1월 16일 목요일 00:00",
    );
  });

  it("유효하지 않은 문자열은 원본을 그대로 반환한다", () => {
    expect(formatScheduledAt("invalid")).toBe("invalid");
  });
});

describe("getTimeAgo", () => {
  const NOW = new Date("2025-01-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("당일이면 '오늘'을 반환한다", () => {
    expect(getTimeAgo("2025-01-15T00:00:00.000Z")).toBe("오늘");
  });

  it("1일 전이면 '1일 전'을 반환한다", () => {
    expect(getTimeAgo("2025-01-14T12:00:00.000Z")).toBe("1일 전");
  });

  it("30일 전이면 '30일 전'을 반환한다", () => {
    expect(getTimeAgo("2024-12-16T12:00:00.000Z")).toBe("30일 전");
  });

  it("미래 날짜는 '오늘'을 반환한다", () => {
    expect(getTimeAgo("2025-01-16T12:00:00.000Z")).toBe("오늘");
  });
});

describe("toDatetimeLocalValue", () => {
  it("유효하지 않은 문자열은 빈 문자열을 반환한다", () => {
    expect(toDatetimeLocalValue("invalid")).toBe("");
  });

  it("유효한 ISO 문자열을 datetime-local 입력 형식(YYYY-MM-DDTHH:MM)으로 반환한다", () => {
    // 로컬 타임존 의존 함수이므로 형식만 검증
    const result = toDatetimeLocalValue("2025-01-15T06:30:00.000Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});
