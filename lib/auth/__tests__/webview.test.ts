import { describe, expect, it } from "vitest";

import { isAndroidUserAgent, isLikelyWebViewUserAgent } from "../webview";

describe("isLikelyWebViewUserAgent", () => {
  it("Android WebView user-agent를 웹뷰로 판단한다", () => {
    const userAgent =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36";

    expect(isLikelyWebViewUserAgent(userAgent)).toBe(true);
  });

  it("iOS WebView user-agent를 웹뷰로 판단한다", () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

    expect(isLikelyWebViewUserAgent(userAgent)).toBe(true);
  });

  it("알려진 인앱 브라우저 user-agent를 웹뷰로 판단한다", () => {
    const userAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1 Instagram 312.0.0.0.0";

    expect(isLikelyWebViewUserAgent(userAgent)).toBe(true);
  });

  it("일반 Chrome 브라우저 user-agent는 웹뷰로 판단하지 않는다", () => {
    const userAgent =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

    expect(isLikelyWebViewUserAgent(userAgent)).toBe(false);
  });
});

describe("isAndroidUserAgent", () => {
  it("Android user-agent 여부를 판단한다", () => {
    expect(isAndroidUserAgent("Mozilla/5.0 (Linux; Android 13)")).toBe(true);
    expect(isAndroidUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_2)")).toBe(
      false,
    );
  });
});
