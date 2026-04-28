import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "../proxy";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

const AUTH_COOKIE_NAME = "sb-project-ref-auth-token";
const SUPABASE_URL = "https://project-ref.supabase.co";

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
  });

  it("루트 요청에 인증 claims가 있으면 대시보드로 보낸다", async () => {
    mockSupabaseClaims({ sub: "user-id" });
    const request = createRequest("/", `${AUTH_COOKIE_NAME}=session-cookie`);

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBe(
      "https://example.com/dashboard",
    );
  });

  it("루트 요청에 인증 claims가 없으면 공개 홈을 유지한다", async () => {
    mockSupabaseClaims(null);
    const request = createRequest("/");

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBeNull();
  });

  it("보호 라우트에서 인증 claims가 없으면 로그인 페이지로 보낸다", async () => {
    mockSupabaseClaims(null);

    const response = await updateSession(createRequest("/dashboard"));

    expect(response.headers.get("location")).toBe("https://example.com/login");
  });

  it("보호 라우트에서 인증 claims가 있으면 요청을 통과시킨다", async () => {
    mockSupabaseClaims({ sub: "user-id" });

    const response = await updateSession(createRequest("/dashboard"));

    expect(response.headers.get("location")).toBeNull();
  });
});

function createRequest(pathname: string, cookie?: string) {
  return new NextRequest(`https://example.com${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

function mockSupabaseClaims(claims: null | { sub: string }) {
  vi.mocked(createServerClient).mockReturnValue({
    auth: {
      getClaims: vi.fn().mockResolvedValue({ data: { claims } }),
    },
  } as never);
}
