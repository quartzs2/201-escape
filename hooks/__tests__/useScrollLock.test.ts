import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useScrollLock } from "../useScrollLock";

afterEach(() => {
  cleanup();
  document.documentElement.style.scrollbarGutter = "";
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
});

describe("useScrollLock", () => {
  describe("isActive: false", () => {
    it("스타일을 변경하지 않는다", () => {
      renderHook(() => useScrollLock(false));

      expect(document.documentElement.style.scrollbarGutter).toBe("");
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("isActive: true", () => {
    it("overflow를 hidden으로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("overscrollBehavior를 none으로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("scrollbarGutter를 stable로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.documentElement.style.scrollbarGutter).toBe("stable");
    });
  });

  describe("언마운트", () => {
    it("isActive: true 상태에서 언마운트하면 스타일을 초기화한다", () => {
      const { unmount } = renderHook(() => useScrollLock(true));

      unmount();

      expect(document.documentElement.style.scrollbarGutter).toBe("");
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });

    it("isActive: false 상태에서 언마운트해도 스타일은 그대로다", () => {
      const { unmount } = renderHook(() => useScrollLock(false));

      unmount();

      expect(document.documentElement.style.scrollbarGutter).toBe("");
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("isActive 변경", () => {
    it("false에서 true로 바뀌면 스타일을 적용한다", () => {
      const { rerender } = renderHook(
        ({ isActive }: { isActive: boolean }) => useScrollLock(isActive),
        { initialProps: { isActive: false } },
      );

      expect(document.body.style.overflow).toBe("");

      rerender({ isActive: true });

      expect(document.documentElement.style.scrollbarGutter).toBe("stable");
      expect(document.body.style.overflow).toBe("hidden");
      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("true에서 false로 바뀌면 스타일을 초기화한다", () => {
      const { rerender } = renderHook(
        ({ isActive }: { isActive: boolean }) => useScrollLock(isActive),
        { initialProps: { isActive: true } },
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender({ isActive: false });

      expect(document.documentElement.style.scrollbarGutter).toBe("");
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("다중 소유자", () => {
    it("두 번째 소유자가 추가되어도 스타일을 중복 적용하지 않는다", () => {
      renderHook(() => useScrollLock(true));
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("첫 번째 소유자가 해제되어도 두 번째 소유자가 있으면 스타일이 유지된다", () => {
      const { unmount: unmountFirst } = renderHook(() => useScrollLock(true));
      renderHook(() => useScrollLock(true));

      unmountFirst();

      expect(document.documentElement.style.scrollbarGutter).toBe("stable");
      expect(document.body.style.overflow).toBe("hidden");
      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("모든 소유자가 해제되면 스타일을 초기화한다", () => {
      const { unmount: unmountFirst } = renderHook(() => useScrollLock(true));
      const { unmount: unmountSecond } = renderHook(() => useScrollLock(true));

      unmountFirst();
      unmountSecond();

      expect(document.documentElement.style.scrollbarGutter).toBe("");
      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });
});
