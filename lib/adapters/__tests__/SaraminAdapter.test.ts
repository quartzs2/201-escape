import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/adapters/utils/html-fetcher");

import { SaraminAdapter } from "@/lib/adapters/SaraminAdapter";
import { fetchHtml } from "@/lib/adapters/utils/html-fetcher";
import { SARAMIN_JOB_DEFAULTS } from "@/lib/types/job";

const mockFetchHtml = vi.mocked(fetchHtml);

describe("SaraminAdapter", () => {
  let adapter: SaraminAdapter;

  beforeAll(() => {
    adapter = new SaraminAdapter();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("supports", () => {
    it("saramin.co.kr를 포함하는 URL에 대해 true를 반환한다", () => {
      expect(
        adapter.supports(
          "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
        ),
      ).toBe(true);
    });

    it("서브도메인이 없는 saramin.co.kr URL에 대해 true를 반환한다", () => {
      expect(
        adapter.supports("https://saramin.co.kr/zf_user/jobs/view/12345"),
      ).toBe(true);
    });

    it("saramin.co.kr를 포함하지 않는 URL에 대해 false를 반환한다", () => {
      expect(adapter.supports("https://www.wanted.co.kr/wd/12345")).toBe(false);
    });

    it("빈 문자열에 대해 false를 반환한다", () => {
      expect(adapter.supports("")).toBe(false);
    });
  });

  describe("transform", () => {
    it("완전한 데이터로 JobPost를 반환한다", () => {
      const result = adapter.transform({
        company_name: "카카오",
        id: "12345",
        title: "프론트엔드 개발자",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
      });

      expect(result.id).toBe("12345");
      expect(result.title).toBe("프론트엔드 개발자");
      expect(result.companyName).toBe("카카오");
      expect(result.url).toBe(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
      );
      expect(result.platform).toBe(SARAMIN_JOB_DEFAULTS.platform);
      expect(result.status).toBe(SARAMIN_JOB_DEFAULTS.status);
    });

    it("title이 없을 때 position_title을 사용한다", () => {
      const result = adapter.transform({
        company_name: "네이버",
        id: "999",
        position_title: "백엔드 개발자",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=999",
      });

      expect(result.title).toBe("백엔드 개발자");
    });

    it("title과 position_title이 없을 때 job_title을 사용한다", () => {
      const result = adapter.transform({
        company_name: "라인",
        id: "888",
        job_title: "풀스택 개발자",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=888",
      });

      expect(result.title).toBe("풀스택 개발자");
    });

    it("company_name이 없을 때 company.name을 사용한다", () => {
      const result = adapter.transform({
        company: { name: "쿠팡" },
        id: "111",
        title: "디자이너",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=111",
      });

      expect(result.companyName).toBe("쿠팡");
    });

    it("url이 없을 때 detail_url을 사용한다", () => {
      const detailUrl =
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=222";
      const result = adapter.transform({
        company_name: "토스",
        detail_url: detailUrl,
        id: "222",
        title: "개발자",
      });

      expect(result.url).toBe(detailUrl);
    });

    it("url과 detail_url이 없을 때 link를 사용한다", () => {
      const link =
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=333";
      const result = adapter.transform({
        company_name: "당근마켓",
        id: "333",
        link,
        title: "개발자",
      });

      expect(result.url).toBe(link);
    });

    it("id가 숫자형이면 문자열로 변환한다", () => {
      const result = adapter.transform({
        company_name: "토스",
        id: 67890,
        title: "개발자",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=67890",
      });

      expect(result.id).toBe("67890");
    });

    it("id가 없을 때 job_id를 사용한다", () => {
      const result = adapter.transform({
        company_name: "카카오",
        job_id: "54321",
        title: "개발자",
      });

      expect(result.id).toBe("54321");
    });

    it("title 관련 필드가 모두 없으면 기본값을 사용한다", () => {
      const result = adapter.transform({ company_name: "카카오", id: "1" });

      expect(result.title).toBe(SARAMIN_JOB_DEFAULTS.title);
    });

    it("company_name과 company.name이 모두 없으면 기본값을 사용한다", () => {
      const result = adapter.transform({ id: "1", title: "개발자" });

      expect(result.companyName).toBe(SARAMIN_JOB_DEFAULTS.companyName);
    });

    it("url 관련 필드가 모두 없으면 기본값을 사용한다", () => {
      const result = adapter.transform({ id: "1", title: "개발자" });

      expect(result.url).toBe(SARAMIN_JOB_DEFAULTS.url);
    });

    it("id와 job_id가 모두 없으면 UUID를 생성한다", () => {
      const result = adapter.transform({
        company_name: "A사",
        title: "개발자",
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("appliedDate가 ISO 문자열 형식이다", () => {
      const result = adapter.transform({ id: "1", title: "개발자" });

      expect(result.appliedDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("null을 입력하면 에러를 던진다", () => {
      expect(() => adapter.transform(null)).toThrow("사람인 공고 파싱 실패");
    });

    it("문자열을 입력하면 에러를 던진다", () => {
      expect(() => adapter.transform("invalid")).toThrow(
        "사람인 공고 파싱 실패",
      );
    });

    it("배열을 입력하면 에러를 던진다", () => {
      expect(() => adapter.transform([])).toThrow("사람인 공고 파싱 실패");
    });
  });

  describe("fetch", () => {
    it("JSON-LD에서 title, companyName, id, url을 추출한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "JobPosting",
                "title": "프론트엔드 개발자",
                "hiringOrganization": { "name": "카카오" },
                "url": "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345"
              }
            </script>
          </head>
        </html>
      `);

      const result = await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
      );

      expect(result).toMatchObject({
        company_name: "카카오",
        id: "12345",
        title: "프론트엔드 개발자",
        url: "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=12345",
      });
    });

    it("JSON-LD가 없을 때 og:title 메타 태그에서 title을 추출한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <head>
            <meta property="og:title" content="시니어 개발자" />
            <meta property="og:site_name" content="네이버" />
          </head>
        </html>
      `);

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=11111",
      )) as Record<string, unknown>;

      expect(result.title).toBe("시니어 개발자");
      expect(result.company_name).toBe("네이버");
    });

    it("og 메타 태그가 없을 때 twitter:title 메타 태그에서 title을 추출한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <head>
            <meta name="twitter:title" content="백엔드 개발자" />
          </head>
        </html>
      `);

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=22222",
      )) as Record<string, unknown>;

      expect(result.title).toBe("백엔드 개발자");
    });

    it("메타 태그가 없을 때 h1[class*='tit'] 셀렉터에서 title을 추출한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <body>
            <h1 class="job_tit">데이터 엔지니어</h1>
          </body>
        </html>
      `);

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=33333",
      )) as Record<string, unknown>;

      expect(result.title).toBe("데이터 엔지니어");
    });

    it("메타 태그가 없을 때 .company_nm 셀렉터에서 companyName을 추출한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <body>
            <h1>DevOps 엔지니어</h1>
            <span class="company_nm">라인플러스</span>
          </body>
        </html>
      `);

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=44444",
      )) as Record<string, unknown>;

      expect(result.company_name).toBe("라인플러스");
    });

    it("rec_idx 패턴으로 URL에서 id를 추출한다", async () => {
      mockFetchHtml.mockResolvedValue("<html><body></body></html>");

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=55555",
      )) as Record<string, unknown>;

      expect(result.id).toBe("55555");
    });

    it("job/{slug}/{id} 패턴으로 URL에서 id를 추출한다", async () => {
      mockFetchHtml.mockResolvedValue("<html><body></body></html>");

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/job/frontend-developer/66666",
      )) as Record<string, unknown>;

      expect(result.id).toBe("66666");
    });

    it("/숫자 패턴으로 URL에서 id를 추출한다", async () => {
      mockFetchHtml.mockResolvedValue("<html><body></body></html>");

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/view/77777",
      )) as Record<string, unknown>;

      expect(result.id).toBe("77777");
    });

    it("HTML에 정보가 없을 때 url 필드에 원본 URL을 반환한다", async () => {
      const originalUrl =
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=88888";
      mockFetchHtml.mockResolvedValue("<html><body></body></html>");

      const result = (await adapter.fetch(originalUrl)) as Record<
        string,
        unknown
      >;

      expect(result.url).toBe(originalUrl);
    });

    it("JSON-LD가 JobPosting 타입이 아니면 무시한다", async () => {
      mockFetchHtml.mockResolvedValue(`
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "Organization",
                "name": "카카오",
                "url": "https://www.kakao.com"
              }
            </script>
            <meta property="og:title" content="풀스택 개발자" />
          </head>
        </html>
      `);

      const result = (await adapter.fetch(
        "https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=99999",
      )) as Record<string, unknown>;

      expect(result.title).toBe("풀스택 개발자");
    });
  });
});
