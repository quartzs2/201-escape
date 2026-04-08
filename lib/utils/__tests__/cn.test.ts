import { describe, expect, it } from "vitest";

import { cn } from "../cn";

describe("cn", () => {
  it("단일 클래스 문자열을 그대로 반환한다", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("여러 클래스 문자열을 공백으로 합친다", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("falsy 값(false, null, undefined, 0)을 무시한다", () => {
    expect(cn("foo", false, null, undefined, 0, "bar")).toBe("foo bar");
  });

  it("조건부 객체에서 true인 키만 포함한다", () => {
    expect(cn({ bar: false, baz: true, foo: true })).toBe("baz foo");
  });

  it("배열 안의 클래스를 평탄화한다", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("Tailwind 충돌 클래스 중 마지막 클래스만 남긴다", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("Tailwind 방향별 충돌 클래스를 올바르게 병합한다", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("충돌하지 않는 Tailwind 클래스는 모두 유지한다", () => {
    expect(cn("p-4", "m-4")).toBe("p-4 m-4");
  });

  it("조건부 객체와 문자열을 함께 처리한다", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("인수 없이 호출하면 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });

  it("빈 문자열 인수는 무시한다", () => {
    expect(cn("", "foo", "")).toBe("foo");
  });

  it("Tailwind 변형(variant) 접두사가 있는 충돌 클래스를 올바르게 병합한다", () => {
    expect(cn("hover:p-4", "hover:p-8")).toBe("hover:p-8");
  });

  it("서로 다른 변형의 같은 속성은 충돌하지 않는다", () => {
    expect(cn("p-4", "hover:p-8")).toBe("p-4 hover:p-8");
  });
});
