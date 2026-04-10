import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollLock } from "../useScrollLock";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.overscrollBehavior = "";
  document.body.style.paddingRight = "";
});

describe("useScrollLock", () => {
  describe("isActive: false", () => {
    it("스타일을 변경하지 않는다", () => {
      renderHook(() => useScrollLock(false));

      expect(document.body.style.position).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("isActive: true", () => {
    it("position을 fixed로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.position).toBe("fixed");
    });

    it("overscrollBehavior를 none으로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("width를 100%로 설정한다", () => {
      renderHook(() => useScrollLock(true));

      expect(document.body.style.width).toBe("100%");
    });

    it("현재 스크롤 위치를 top에 반영한다", () => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 300,
      });

      renderHook(() => useScrollLock(true));

      expect(document.body.style.top).toBe("-300px");
    });
  });

  describe("언마운트", () => {
    it("isActive: true 상태에서 언마운트하면 스타일을 초기화한다", () => {
      const { unmount } = renderHook(() => useScrollLock(true));

      unmount();

      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(document.body.style.width).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });

    it("isActive: true 상태에서 언마운트하면 스크롤 위치를 복원한다", () => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 200,
      });

      const { unmount } = renderHook(() => useScrollLock(true));

      unmount();

      expect(window.scrollTo).toHaveBeenCalledWith(0, 200);
    });

    it("isActive: false 상태에서 언마운트해도 스타일은 그대로다", () => {
      const { unmount } = renderHook(() => useScrollLock(false));

      unmount();

      expect(document.body.style.position).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("isActive 변경", () => {
    it("false에서 true로 바뀌면 스타일을 적용한다", () => {
      const { rerender } = renderHook(
        ({ isActive }: { isActive: boolean }) => useScrollLock(isActive),
        { initialProps: { isActive: false } },
      );

      expect(document.body.style.position).toBe("");

      rerender({ isActive: true });

      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("true에서 false로 바뀌면 스타일을 초기화한다", () => {
      const { rerender } = renderHook(
        ({ isActive }: { isActive: boolean }) => useScrollLock(isActive),
        { initialProps: { isActive: true } },
      );

      expect(document.body.style.position).toBe("fixed");

      rerender({ isActive: false });

      expect(document.body.style.position).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });
  });

  describe("다중 소유자", () => {
    it("두 번째 소유자가 추가되어도 스타일을 중복 적용하지 않는다", () => {
      renderHook(() => useScrollLock(true));
      renderHook(() => useScrollLock(true));

      expect(document.body.style.position).toBe("fixed");
    });

    it("첫 번째 소유자가 해제되어도 두 번째 소유자가 있으면 스타일이 유지된다", () => {
      const { unmount: unmountFirst } = renderHook(() => useScrollLock(true));
      renderHook(() => useScrollLock(true));

      unmountFirst();

      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.overscrollBehavior).toBe("none");
    });

    it("모든 소유자가 해제되면 스타일을 초기화한다", () => {
      const { unmount: unmountFirst } = renderHook(() => useScrollLock(true));
      const { unmount: unmountSecond } = renderHook(() => useScrollLock(true));

      unmountFirst();
      unmountSecond();

      expect(document.body.style.position).toBe("");
      expect(document.body.style.overscrollBehavior).toBe("");
    });

    it("모든 소유자가 해제되면 스크롤 위치를 복원한다", () => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 100,
      });

      const { unmount: unmountFirst } = renderHook(() => useScrollLock(true));
      const { unmount: unmountSecond } = renderHook(() => useScrollLock(true));

      unmountFirst();
      unmountSecond();

      expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
    });
  });
});
