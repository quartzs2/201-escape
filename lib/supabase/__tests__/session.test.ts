import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSupabaseAccessTokenFromCookie } from "../session";

const mockCookies = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

const SUPABASE_URL = "https://project-ref.supabase.co";
const AUTH_COOKIE_NAME = "sb-project-ref-auth-token";

describe("getSupabaseAccessTokenFromCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
  });

  it("Supabase 세션 쿠키에서 access token을 읽는다", async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [
        {
          name: AUTH_COOKIE_NAME,
          value: JSON.stringify({ access_token: "access-token" }),
        },
      ],
    });

    await expect(getSupabaseAccessTokenFromCookie()).resolves.toBe(
      "access-token",
    );
  });

  it("base64url로 인코딩된 세션 쿠키를 디코딩한다", async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [
        {
          name: AUTH_COOKIE_NAME,
          value: `base64-${toBase64Url(
            JSON.stringify({ access_token: "encoded-token" }),
          )}`,
        },
      ],
    });

    await expect(getSupabaseAccessTokenFromCookie()).resolves.toBe(
      "encoded-token",
    );
  });

  it("chunk로 분리된 세션 쿠키를 합쳐서 읽는다", async () => {
    const cookieValue = JSON.stringify({ access_token: "chunked-token" });

    mockCookies.mockResolvedValue({
      getAll: () => [
        { name: `${AUTH_COOKIE_NAME}.0`, value: cookieValue.slice(0, 20) },
        { name: `${AUTH_COOKIE_NAME}.1`, value: cookieValue.slice(20) },
      ],
    });

    await expect(getSupabaseAccessTokenFromCookie()).resolves.toBe(
      "chunked-token",
    );
  });

  it("세션 쿠키가 없으면 null을 반환한다", async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [],
    });

    await expect(getSupabaseAccessTokenFromCookie()).resolves.toBeNull();
  });
});

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}
