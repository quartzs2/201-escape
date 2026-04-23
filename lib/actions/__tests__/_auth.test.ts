import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUserId } from "../_auth";

const mockGetClaims = vi.fn();
const { mockTrackAuthenticatedUserActivity } = vi.hoisted(() => ({
  mockTrackAuthenticatedUserActivity: vi.fn(),
}));

vi.mock("@/lib/analytics/server", () => ({
  trackAuthenticatedUserActivity: mockTrackAuthenticatedUserActivity,
}));

describe("getAuthenticatedUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("전달된 access token으로 claims를 검증한다", async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
      error: null,
    });

    const result = await getAuthenticatedUserId(
      {
        auth: {
          getClaims: mockGetClaims,
        },
      } as never,
      "access-token",
    );

    expect(mockGetClaims).toHaveBeenCalledWith("access-token");
    expect(mockTrackAuthenticatedUserActivity).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      ok: true,
      userId: "user-1",
    });
  });

  it("token 없이 호출되면 기존처럼 claims를 직접 조회한다", async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: "user-2" } },
      error: null,
    });

    await getAuthenticatedUserId({
      auth: {
        getClaims: mockGetClaims,
      },
    } as never);

    expect(mockGetClaims).toHaveBeenCalledWith(undefined);
  });

  it("claims 검증에 실패하면 인증 실패를 반환한다", async () => {
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: "invalid token" },
    });

    const result = await getAuthenticatedUserId(
      {
        auth: {
          getClaims: mockGetClaims,
        },
      } as never,
      "expired-token",
    );

    expect(result).toEqual({
      ok: false,
      reason: "로그인이 필요합니다.",
    });
    expect(mockTrackAuthenticatedUserActivity).not.toHaveBeenCalled();
  });
});
