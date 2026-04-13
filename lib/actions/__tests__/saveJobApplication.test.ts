import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveJobApplicationInput } from "@/lib/types/jobApplication";

import { AUTH_ERROR_CODE } from "@/lib/actions/_queryError";
import { trackServerEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

import { saveJobApplication } from "../saveJobApplication";

vi.mock("@/lib/analytics/server", () => ({
  trackServerEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockRpc = vi.fn();
const mockGetUser = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  rpc: mockRpc,
};

const VALID_INPUT: SaveJobApplicationInput = {
  companyName: "카카오",
  originUrl: "https://www.wanted.co.kr/wd/12345",
  platform: "WANTED",
  positionTitle: "프론트엔드 개발자",
};

const VALID_PAYLOAD = {
  applicationId: "550e8400-e29b-41d4-a716-446655440000",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-1" } },
    error: null,
  });
  mockRpc.mockResolvedValue({ data: VALID_PAYLOAD, error: null });
});

describe("saveJobApplication", () => {
  describe("입력 유효성 검사 실패", () => {
    it("companyName이 빈 문자열이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await saveJobApplication({
        ...VALID_INPUT,
        companyName: "",
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("positionTitle이 빈 문자열이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await saveJobApplication({
        ...VALID_INPUT,
        positionTitle: "",
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("originUrl이 유효하지 않은 URL이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await saveJobApplication({
        ...VALID_INPUT,
        originUrl: "not-a-url",
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("platform이 허용되지 않은 값이면 VALIDATION_ERROR를 반환한다", async () => {
      const result = await saveJobApplication({
        ...VALID_INPUT,
        platform: "INVALID" as SaveJobApplicationInput["platform"],
      });

      expect(result).toMatchObject({ code: "VALIDATION_ERROR", ok: false });
    });

    it("유효성 검사 실패 시 fieldErrors를 포함한다", async () => {
      const result = await saveJobApplication({
        ...VALID_INPUT,
        companyName: "",
      });

      expect(result).toMatchObject({
        fieldErrors: { companyName: expect.anything() },
        ok: false,
      });
    });

    it("유효성 검사 실패 시 supabase를 호출하지 않는다", async () => {
      await saveJobApplication({ ...VALID_INPUT, companyName: "" });

      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe("인증 실패", () => {
    it("auth.getUser가 에러를 반환하면 AUTH_REQUIRED를 반환한다", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "JWT expired" },
      });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("user가 null이면 AUTH_REQUIRED를 반환한다", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("인증 실패 시 rpc를 호출하지 않는다", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      await saveJobApplication(VALID_INPUT);

      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  describe("RPC 오류", () => {
    it("RPC 에러가 발생하면 RPC_ERROR를 반환한다", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value" },
      });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "RPC_ERROR", ok: false });
    });

    it(`RPC 에러 코드가 ${AUTH_ERROR_CODE}이면 AUTH_REQUIRED를 반환한다`, async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: AUTH_ERROR_CODE, message: "permission denied" },
      });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "AUTH_REQUIRED", ok: false });
    });

    it("RPC 에러 메시지를 reason에 포함한다", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: "P0001", message: "custom error" },
      });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ ok: false, reason: "custom error" });
    });

    it("RPC 에러에 details가 있으면 reason에 포함한다", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { code: "P0001", details: "세부 정보", message: "오류 발생" },
      });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({
        ok: false,
        reason: "오류 발생 (세부 정보)",
      });
    });
  });

  describe("RPC 응답 파싱 실패", () => {
    it("RPC 응답이 유효하지 않은 형태이면 UNKNOWN_ERROR를 반환한다", async () => {
      mockRpc.mockResolvedValue({ data: { invalid: "shape" }, error: null });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "UNKNOWN_ERROR", ok: false });
    });

    it("RPC 응답이 null이면 UNKNOWN_ERROR를 반환한다", async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ code: "UNKNOWN_ERROR", ok: false });
    });

    it("RPC 응답이 배열로 감싸져 있어도 첫 번째 요소를 파싱한다", async () => {
      mockRpc.mockResolvedValue({ data: [VALID_PAYLOAD], error: null });

      const result = await saveJobApplication(VALID_INPUT);

      expect(result.ok).toBe(true);
    });
  });

  describe("성공", () => {
    it("유효한 입력과 정상 응답이면 ok: true와 data를 반환한다", async () => {
      const result = await saveJobApplication(VALID_INPUT);

      expect(result).toMatchObject({ data: VALID_PAYLOAD, ok: true });
      expect(trackServerEvent).toHaveBeenCalledWith(
        "user-1",
        "application_add_saved",
      );
    });

    it("선택 필드를 포함한 전체 입력도 성공적으로 처리한다", async () => {
      const fullInput: SaveJobApplicationInput = {
        ...VALID_INPUT,
        appliedAt: "2024-01-01T00:00:00+09:00",
        description: "직무 설명",
        notes: "메모",
        rawData: { key: "value" },
        status: "APPLIED",
      };

      const result = await saveJobApplication(fullInput);

      expect(result.ok).toBe(true);
    });

    it("RPC 호출 시 파싱된 입력값을 올바르게 전달한다", async () => {
      await saveJobApplication(VALID_INPUT);

      expect(mockRpc).toHaveBeenCalledWith("save_application", {
        p_applied_at: null,
        p_company_name: "카카오",
        p_description: null,
        p_notes: null,
        p_origin_url: "https://www.wanted.co.kr/wd/12345",
        p_platform: "WANTED",
        p_position_title: "프론트엔드 개발자",
        p_raw_data: null,
        p_status: null,
      });
    });
  });
});
