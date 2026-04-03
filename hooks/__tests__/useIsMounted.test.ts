import { cleanup, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { useIsMounted } from "../useIsMounted";

afterEach(() => {
  cleanup();
});

describe("useIsMounted", () => {
  describe("클라이언트 환경", () => {
    it("마운트되면 true를 반환한다", () => {
      const { result } = renderHook(() => useIsMounted());

      expect(result.current).toBe(true);
    });
  });

  describe("서버 환경(SSR)", () => {
    it("서버 렌더링 중에는 false를 반환한다", () => {
      function TestComponent() {
        const isMounted = useIsMounted();
        return createElement("span", { "data-is-mounted": String(isMounted) });
      }

      const html = renderToString(createElement(TestComponent));

      expect(html).toContain('data-is-mounted="false"');
    });
  });
});
