import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_CODE } from "@/lib/actions/_queryError";
import { createClientWithToken } from "@/lib/supabase/server";

import { getAuthContext } from "../_authContext";
import { verifyApplicationOwnership } from "../_verifyApplicationOwnership";

vi.mock("@/lib/supabase/server", () => ({
  createClientWithToken: vi.fn(),
}));

vi.mock("../_authContext", () => ({
  getAuthContext: vi.fn(),
}));

const mockMaybeSingle = vi.fn();
const mockEqUserId = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockEqId = vi.fn(() => ({ eq: mockEqUserId }));
const mockSelect = vi.fn(() => ({ eq: mockEqId }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSupabase = {
  from: mockFrom,
};

const ACCESS_TOKEN = "access-token";
const APPLICATION_ID = "550e8400-e29b-41d4-a716-446655440000";
const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClientWithToken).mockReturnValue(mockSupabase as never);
  vi.mocked(getAuthContext).mockResolvedValue({
    accessToken: ACCESS_TOKEN,
    ok: true,
    userId: USER_ID,
  });
  mockMaybeSingle.mockResolvedValue({
    data: { id: APPLICATION_ID },
    error: null,
  });
});

describe("verifyApplicationOwnership", () => {
  describe("인증 실패", () => {
    it("인증 컨텍스트가 실패하면 AUTH_REQUIRED를 반환한다", async () => {
      vi.mocked(getAuthContext).mockResolvedValue({
        ok: false,
        reason: "로그인이 필요합니다.",
      });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("인증 실패 시 from을 호출하지 않는다", async () => {
      vi.mocked(getAuthContext).mockResolvedValue({
        ok: false,
        reason: "로그인이 필요합니다.",
      });

      await verifyApplicationOwnership(APPLICATION_ID);

      expect(createClientWithToken).not.toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("쿼리 오류", () => {
    it("쿼리 에러가 발생하면 QUERY_ERROR를 반환한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value" },
      });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({ code: "QUERY_ERROR", ok: false });
    });

    it(`쿼리 에러 코드가 ${AUTH_ERROR_CODE}이면 AUTH_REQUIRED를 반환한다`, async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: AUTH_ERROR_CODE, message: "permission denied" },
      });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("쿼리 에러 메시지를 reason에 포함한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "P0001", message: "custom error" },
      });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({ ok: false, reason: "custom error" });
    });

    it("쿼리 에러에 details가 있으면 reason에 포함한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "P0001", details: "세부 정보", message: "오류 발생" },
      });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({
        ok: false,
        reason: "오류 발생 (세부 정보)",
      });
    });
  });

  describe("대상 없음", () => {
    it("data가 null이면 NOT_FOUND를 반환한다", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({ code: "NOT_FOUND", ok: false });
    });
  });

  describe("성공", () => {
    it("ok: true와 supabase 클라이언트, userId를 반환한다", async () => {
      const result = await verifyApplicationOwnership(APPLICATION_ID);

      expect(result).toMatchObject({
        ok: true,
        supabase: mockSupabase,
        userId: USER_ID,
      });
    });

    it("access token으로 Supabase 클라이언트를 생성한다", async () => {
      await verifyApplicationOwnership(APPLICATION_ID);

      expect(createClientWithToken).toHaveBeenCalledWith(ACCESS_TOKEN);
    });

    it("select 쿼리 시 applicationId와 userId를 올바르게 전달한다", async () => {
      await verifyApplicationOwnership(APPLICATION_ID);

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockSelect).toHaveBeenCalledWith("id");
      expect(mockEqId).toHaveBeenCalledWith("id", APPLICATION_ID);
      expect(mockEqUserId).toHaveBeenCalledWith("user_id", USER_ID);
    });
  });
});
