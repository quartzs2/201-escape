import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdapterFactory } from "@/lib/adapters/AdapterFactory";
import { ManualAdapter } from "@/lib/adapters/ManualAdapter";
import { SaraminAdapter } from "@/lib/adapters/SaraminAdapter";
import { WantedAdapter } from "@/lib/adapters/WantedAdapter";
import {
  JobPost,
  MANUAL_JOB_DEFAULTS,
  SARAMIN_JOB_DEFAULTS,
  WANTED_JOB_DEFAULTS,
} from "@/lib/types/job";

const makeJobPost = (overrides: Partial<JobPost> = {}): JobPost =>
  ({
    appliedDate: "2024-01-01T00:00:00.000Z",
    companyName: "테스트 회사",
    id: "test-id",
    platform: WANTED_JOB_DEFAULTS.platform,
    status: WANTED_JOB_DEFAULTS.status,
    title: "테스트 공고",
    url: "https://www.wanted.co.kr/wd/12345",
    ...overrides,
  }) as JobPost;

describe("AdapterFactory", () => {
  describe("getAdapter", () => {
    it("wanted.co.kr URL에 대해 WantedAdapter를 반환한다", () => {
      const adapter = AdapterFactory.getAdapter(
        "https://www.wanted.co.kr/wd/12345",
      );

      expect(adapter).toBeInstanceOf(WantedAdapter);
    });

    it("saramin.co.kr URL에 대해 SaraminAdapter를 반환한다", () => {
      const adapter = AdapterFactory.getAdapter(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
      );

      expect(adapter).toBeInstanceOf(SaraminAdapter);
    });

    it("지원하지 않는 플랫폼 URL에 대해 ManualAdapter를 반환한다", () => {
      const adapter = AdapterFactory.getAdapter(
        "https://www.jobkorea.co.kr/Recruit/GI_Read/12345",
      );

      expect(adapter).toBeInstanceOf(ManualAdapter);
    });

    it("빈 문자열에 대해 ManualAdapter를 반환한다", () => {
      const adapter = AdapterFactory.getAdapter("");

      expect(adapter).toBeInstanceOf(ManualAdapter);
    });
  });

  describe("extractFromUrl", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("ManualAdapter URL이면 fetch 없이 { url }을 인수로 transform을 호출한다", async () => {
      const url = "https://unknown-site.com/job/123";
      const mockFetch = vi
        .spyOn(ManualAdapter.prototype, "fetch")
        .mockResolvedValue(undefined);
      const mockTransform = vi
        .spyOn(ManualAdapter.prototype, "transform")
        .mockReturnValue(
          makeJobPost({ platform: MANUAL_JOB_DEFAULTS.platform, url }),
        );

      await AdapterFactory.extractFromUrl(url);

      expect(mockTransform).toHaveBeenCalledWith({ url });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("WantedAdapter URL이면 fetch 후 transform 결과를 반환한다", async () => {
      const url = "https://www.wanted.co.kr/wd/12345";
      const rawContent = {
        company_name: "카카오",
        id: "12345",
        title: "프론트엔드 개발자",
        url,
      };
      const jobPost = makeJobPost({ url });

      const mockFetch = vi
        .spyOn(WantedAdapter.prototype, "fetch")
        .mockResolvedValue(rawContent);
      const mockTransform = vi
        .spyOn(WantedAdapter.prototype, "transform")
        .mockReturnValue(jobPost);

      const result = await AdapterFactory.extractFromUrl(url);

      expect(mockFetch).toHaveBeenCalledWith(url);
      expect(mockTransform).toHaveBeenCalledWith(rawContent);
      expect(result).toEqual(jobPost);
    });

    it("SaraminAdapter URL이면 fetch 후 transform 결과를 반환한다", async () => {
      const url =
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345";
      const rawContent = {
        company_name: "네이버",
        id: "12345",
        title: "백엔드 개발자",
        url,
      };
      const jobPost = makeJobPost({
        platform: SARAMIN_JOB_DEFAULTS.platform,
        url,
      });

      const mockFetch = vi
        .spyOn(SaraminAdapter.prototype, "fetch")
        .mockResolvedValue(rawContent);
      const mockTransform = vi
        .spyOn(SaraminAdapter.prototype, "transform")
        .mockReturnValue(jobPost);

      const result = await AdapterFactory.extractFromUrl(url);

      expect(mockFetch).toHaveBeenCalledWith(url);
      expect(mockTransform).toHaveBeenCalledWith(rawContent);
      expect(result).toEqual(jobPost);
    });

    it("transform의 url이 빈 문자열이면 원본 URL로 대체한다", async () => {
      const url = "https://www.wanted.co.kr/wd/12345";
      const jobPost = makeJobPost({ url: "" });

      vi.spyOn(WantedAdapter.prototype, "fetch").mockResolvedValue({});
      vi.spyOn(WantedAdapter.prototype, "transform").mockReturnValue(jobPost);

      const result = await AdapterFactory.extractFromUrl(url);

      expect(result.url).toBe(url);
    });

    it("transform의 url이 공백 문자열이면 원본 URL로 대체한다", async () => {
      const url = "https://www.wanted.co.kr/wd/12345";
      const jobPost = makeJobPost({ url: "   " });

      vi.spyOn(WantedAdapter.prototype, "fetch").mockResolvedValue({});
      vi.spyOn(WantedAdapter.prototype, "transform").mockReturnValue(jobPost);

      const result = await AdapterFactory.extractFromUrl(url);

      expect(result.url).toBe(url);
    });

    it("transform의 url이 유효한 값이면 그대로 반환한다", async () => {
      const originalUrl = "https://www.wanted.co.kr/wd/12345";
      const canonicalUrl = "https://www.wanted.co.kr/wd/12345?ref=nav_bar";
      const jobPost = makeJobPost({ url: canonicalUrl });

      vi.spyOn(WantedAdapter.prototype, "fetch").mockResolvedValue({});
      vi.spyOn(WantedAdapter.prototype, "transform").mockReturnValue(jobPost);

      const result = await AdapterFactory.extractFromUrl(originalUrl);

      expect(result.url).toBe(canonicalUrl);
    });

    it("fetch에서 에러가 발생하면 그대로 전파한다", async () => {
      const url = "https://www.wanted.co.kr/wd/12345";

      vi.spyOn(WantedAdapter.prototype, "fetch").mockRejectedValue(
        new Error("네트워크 오류"),
      );

      await expect(AdapterFactory.extractFromUrl(url)).rejects.toThrow(
        "네트워크 오류",
      );
    });
  });
});
