import type { LookupAddress } from "node:dns";

import { lookup } from "node:dns/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BLOCKED_HOST_REASON,
  INVALID_URL_REASON,
  NOT_ALLOWED_DOMAIN_REASON,
  validateSafeUrl,
} from "@/lib/adapters/utils/url-validator";
import { EXTRACT_JOB_MAX_URL_LENGTH } from "@/lib/constants/extract-job";

vi.mock("node:dns/promises");

// lookup은 오버로드 함수여서 vi.mocked 타입 추론이 단건 반환형으로 고정된다.
// all: true 옵션으로 호출하는 실제 코드와 맞게 배열 반환형으로 명시적 캐스팅한다.
const mockLookup = vi.mocked(lookup) as unknown as {
  mockRejectedValue(error: unknown): void;
  mockResolvedValue(addresses: LookupAddress[]): void;
};

const PUBLIC_IP_RECORD = [{ address: "1.2.3.4", family: 4 as const }];
const SARAMIN_TEST_URL = "https://www.saramin.co.kr/job/123";

describe("validateSafeUrl", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("URL 형식 검증", () => {
    it("빈 문자열이면 INVALID_URL_REASON을 반환한다", async () => {
      const result = await validateSafeUrl("");

      expect(result).toEqual({ ok: false, reason: INVALID_URL_REASON });
    });

    it("URL 형식이 아닌 문자열이면 INVALID_URL_REASON을 반환한다", async () => {
      const result = await validateSafeUrl("not-a-url");

      expect(result).toEqual({ ok: false, reason: INVALID_URL_REASON });
    });

    it(`URL이 ${EXTRACT_JOB_MAX_URL_LENGTH}자를 초과하면 INVALID_URL_REASON을 반환한다`, async () => {
      const overLimitUrl =
        "https://www.saramin.co.kr/" + "a".repeat(EXTRACT_JOB_MAX_URL_LENGTH);

      const result = await validateSafeUrl(overLimitUrl);

      expect(result).toEqual({ ok: false, reason: INVALID_URL_REASON });
    });

    it("http, https 이외의 프로토콜이면 INVALID_URL_REASON을 반환한다", async () => {
      const result = await validateSafeUrl("ftp://saramin.co.kr/job/123");

      expect(result).toEqual({ ok: false, reason: INVALID_URL_REASON });
    });
  });

  describe("허용된 도메인 검증", () => {
    it("지원하지 않는 도메인이면 NOT_ALLOWED_DOMAIN_REASON을 반환한다", async () => {
      const result = await validateSafeUrl(
        "https://www.jobkorea.co.kr/Recruit/GI_Read/12345",
      );

      expect(result).toEqual({ ok: false, reason: NOT_ALLOWED_DOMAIN_REASON });
    });

    it("허용 도메인 문자열을 포함하는 가짜 도메인이면 NOT_ALLOWED_DOMAIN_REASON을 반환한다", async () => {
      const result = await validateSafeUrl(
        "https://wanted.co.kr.evil.com/job/123",
      );

      expect(result).toEqual({ ok: false, reason: NOT_ALLOWED_DOMAIN_REASON });
    });
  });

  describe("DNS 기반 차단 검증", () => {
    it("DNS lookup이 실패하면 BLOCKED_HOST_REASON을 반환한다", async () => {
      mockLookup.mockRejectedValue(new Error("ENOTFOUND"));

      const result = await validateSafeUrl(SARAMIN_TEST_URL);

      expect(result).toEqual({ ok: false, reason: BLOCKED_HOST_REASON });
    });

    it("DNS lookup 결과가 빈 배열이면 BLOCKED_HOST_REASON을 반환한다", async () => {
      mockLookup.mockResolvedValue([]);

      const result = await validateSafeUrl(SARAMIN_TEST_URL);

      expect(result).toEqual({ ok: false, reason: BLOCKED_HOST_REASON });
    });

    it.each([
      { address: "10.0.0.1", desc: "사설 IPv4(10.x.x.x)", family: 4 },
      { address: "127.0.0.1", desc: "루프백 IPv4(127.0.0.1)", family: 4 },
      {
        address: "169.254.1.1",
        desc: "링크-로컬 IPv4(169.254.x.x)",
        family: 4,
      },
      { address: "172.16.0.1", desc: "사설 IPv4(172.16.x.x)", family: 4 },
      { address: "192.168.1.1", desc: "사설 IPv4(192.168.x.x)", family: 4 },
      { address: "::1", desc: "루프백 IPv6(::1)", family: 6 },
      {
        address: "::ffff:192.168.1.1",
        desc: "IPv4-mapped IPv6 사설 주소(::ffff:192.168.1.1)",
        family: 6,
      },
      { address: "fe80::1", desc: "link-local IPv6(fe80::1)", family: 6 },
    ])(
      "DNS가 $desc로 resolve되면 BLOCKED_HOST_REASON을 반환한다",
      async ({ address, family }) => {
        mockLookup.mockResolvedValue([{ address, family }]);

        const result = await validateSafeUrl(SARAMIN_TEST_URL);

        expect(result).toEqual({ ok: false, reason: BLOCKED_HOST_REASON });
      },
    );

    it("공인 IP와 사설 IP가 함께 resolve되면 BLOCKED_HOST_REASON을 반환한다", async () => {
      mockLookup.mockResolvedValue([
        { address: "1.2.3.4", family: 4 },
        { address: "192.168.1.1", family: 4 },
      ]);

      const result = await validateSafeUrl(SARAMIN_TEST_URL);

      expect(result).toEqual({ ok: false, reason: BLOCKED_HOST_REASON });
    });
  });

  describe("유효한 URL", () => {
    beforeEach(() => {
      mockLookup.mockResolvedValue(PUBLIC_IP_RECORD);
    });

    it("saramin.co.kr URL이면 ok: true와 URL 객체를 반환한다", async () => {
      const rawUrl =
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345";

      const result = await validateSafeUrl(rawUrl);

      expect(result).toEqual({ ok: true, value: new URL(rawUrl) });
    });

    it("wanted.co.kr URL이면 ok: true와 URL 객체를 반환한다", async () => {
      const rawUrl = "https://www.wanted.co.kr/wd/12345";

      const result = await validateSafeUrl(rawUrl);

      expect(result).toEqual({ ok: true, value: new URL(rawUrl) });
    });

    it("saramin.co.kr의 서브도메인 URL이면 ok: true를 반환한다", async () => {
      const rawUrl = "https://m.saramin.co.kr/job/123";

      const result = await validateSafeUrl(rawUrl);

      expect(result).toEqual({ ok: true, value: new URL(rawUrl) });
    });

    it("wanted.co.kr의 서브도메인 URL이면 ok: true를 반환한다", async () => {
      const rawUrl = "https://m.wanted.co.kr/wd/12345";

      const result = await validateSafeUrl(rawUrl);

      expect(result).toEqual({ ok: true, value: new URL(rawUrl) });
    });

    it("앞뒤 공백이 포함된 URL이면 trim 후 검증하여 ok: true를 반환한다", async () => {
      const rawUrl = "https://www.saramin.co.kr/job/123";

      const result = await validateSafeUrl(`  ${rawUrl}  `);

      expect(result).toEqual({ ok: true, value: new URL(rawUrl) });
    });
  });
});
