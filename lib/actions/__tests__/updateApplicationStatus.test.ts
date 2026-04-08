import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UpdateApplicationStatusInput } from "@/lib/types/application";

import { AUTH_ERROR_CODE } from "@/lib/actions/_queryError";
import { createClient } from "@/lib/supabase/server";

import { updateApplicationStatus } from "../updateApplicationStatus";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockEqUserId = vi.fn(() => ({ select: mockSelect }));
const mockEqId = vi.fn(() => ({ eq: mockEqUserId }));
const mockUpdate = vi.fn(() => ({ eq: mockEqId }));
const mockFrom = vi.fn(() => ({ update: mockUpdate }));
const mockGetUser = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
};

const VALID_INPUT: UpdateApplicationStatusInput = {
  applicationId: "550e8400-e29b-41d4-a716-446655440000",
  status: "APPLIED",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  });
  mockMaybeSingle.mockResolvedValue({
    data: { id: VALID_INPUT.applicationId },
    error: null,
  });
});

describe("updateApplicationStatus", () => {
  describe("입력 유효성 검사 실패", () => {
    it("applicationId가 유효하지 않은 UUID이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await updateApplicationStatus({
        ...VALID_INPUT,
        applicationId: "not-a-uuid",
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("status가 허용되지 않은 값이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await updateApplicationStatus({
        ...VALID_INPUT,
        status: "INVALID" as UpdateApplicationStatusInput["status"],
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("유효성 검사 실패 시 supabase를 호출하지 않는다", async () => {
      await updateApplicationStatus({
        ...VALID_INPUT,
        applicationId: "not-a-uuid",
      });

      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe("인증 실패", () => {
    it("auth.getUser가 에러를 반환하면 AUTH_REQUIRED를 반환한다", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "JWT expired" },
      });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("user가 null이면 AUTH_REQUIRED를 반환한다", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("인증 실패 시 from을 호출하지 않는다", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      await updateApplicationStatus(VALID_INPUT);

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe("쿼리 오류", () => {
    it("쿼리 에러가 발생하면 QUERY_ERROR를 반환한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value" },
      });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ code: "QUERY_ERROR", ok: false });
    });

    it(`쿼리 에러 코드가 ${AUTH_ERROR_CODE}이면 AUTH_REQUIRED를 반환한다`, async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: AUTH_ERROR_CODE, message: "permission denied" },
      });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("쿼리 에러 메시지를 reason에 포함한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "P0001", message: "custom error" },
      });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ ok: false, reason: "custom error" });
    });

    it("쿼리 에러에 details가 있으면 reason에 포함한다", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { code: "P0001", details: "세부 정보", message: "오류 발생" },
      });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({
        ok: false,
        reason: "오류 발생 (세부 정보)",
      });
    });
  });

  describe("대상 없음", () => {
    it("data가 null이면 NOT_FOUND를 반환한다", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ code: "NOT_FOUND", ok: false });
    });
  });

  describe("성공", () => {
    it("유효한 입력과 정상 응답이면 ok: true를 반환한다", async () => {
      const result = await updateApplicationStatus(VALID_INPUT);

      expect(result).toMatchObject({ ok: true });
    });

    it.each<UpdateApplicationStatusInput["status"]>([
      "SAVED",
      "APPLIED",
      "DOCS_PASSED",
      "INTERVIEWING",
      "OFFERED",
      "REJECTED",
    ])("status=%s로 성공한다", async (status) => {
      const result = await updateApplicationStatus({ ...VALID_INPUT, status });

      expect(result).toMatchObject({ ok: true });
    });

    it("update 쿼리 시 파싱된 입력값을 올바르게 전달한다", async () => {
      await updateApplicationStatus(VALID_INPUT);

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "APPLIED" });
      expect(mockEqId).toHaveBeenCalledWith(
        "id",
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(mockEqUserId).toHaveBeenCalledWith("user_id", "user-1");
    });
  });
});
