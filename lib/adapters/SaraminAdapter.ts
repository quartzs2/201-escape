import { type CheerioAPI, load } from "cheerio";
import { z } from "zod";

import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { fetchHtml } from "@/lib/adapters/utils/html-fetcher";
import {
  asNonEmptyString,
  getFirstString,
  getFirstTextBySelectors,
  getMetaContent,
  isJsonRecord,
  parseJobPostingJsonLd,
} from "@/lib/adapters/utils/parser-helpers";
import { RECRUIT_SITE_URLS } from "@/lib/constants/recruit-sites";
import { JobId, JobPost, SARAMIN_JOB_DEFAULTS } from "@/lib/types/job";

const SARAMIN_ID_PATTERNS = [
  /rec_idx=(\d+)/i,
  /job\/[^\s/]+\/(\d+)/i,
  /\/(\d+)(?:\?|$)/,
];

const SARAMIN_TITLE_SELECTORS = [
  "h1[class*='tit']",
  "h1[class*='job']",
  ".job_tit",
  "h1",
];

const SARAMIN_COMPANY_SELECTORS = [
  ".company_nm",
  ".corp_name",
  "a[href*='company-info']",
  "a[href*='cmp_idx']",
];

export class SaraminAdapter extends BaseAdapter {
  async fetch(url: string): Promise<unknown> {
    const html = await fetchHtml(url);
    const $ = load(html);

    const extracted = extractSaraminData($);
    const title = getFirstString([
      extracted.title,
      getMetaContent($, "meta[property='og:title']"),
      getMetaContent($, "meta[name='twitter:title']"),
      getFirstTextBySelectors($, SARAMIN_TITLE_SELECTORS),
    ]);
    const companyName = getFirstString([
      extracted.companyName,
      getMetaContent($, "meta[property='og:site_name']"),
      getFirstTextBySelectors($, SARAMIN_COMPANY_SELECTORS),
    ]);

    return {
      company_name: companyName,
      detail_url: url,
      id: parseSaraminIdFromUrl(url),
      title,
      url: getFirstString([extracted.url, url]),
    };
  }

  supports(url: string): boolean {
    return url.includes(RECRUIT_SITE_URLS.SARAMIN);
  }

  override transform(rawContent: unknown): JobPost {
    const saraminRawSchema = z.object({
      company: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
      company_name: z.string().optional(),
      detail_url: z.string().optional(),
      id: z.union([z.string(), z.number()]).optional(),
      job_id: z.union([z.string(), z.number()]).optional(),
      job_title: z.string().optional(),
      link: z.string().optional(),
      position_title: z.string().optional(),
      title: z.string().optional(),
      url: z.string().optional(),
    });

    const parsed = saraminRawSchema.safeParse(rawContent);
    const data = parsed.success ? parsed.data : {};

    const id =
      (data.id?.toString() as JobId) ??
      (data.job_id?.toString() as JobId) ??
      (crypto.randomUUID() as JobId);
    const title =
      data.title ??
      data.position_title ??
      data.job_title ??
      SARAMIN_JOB_DEFAULTS.title;
    const companyName =
      data.company_name ??
      data.company?.name ??
      SARAMIN_JOB_DEFAULTS.companyName;
    const url =
      data.url ?? data.detail_url ?? data.link ?? SARAMIN_JOB_DEFAULTS.url;

    return {
      appliedDate: new Date().toISOString(),
      companyName,
      id,
      platform: SARAMIN_JOB_DEFAULTS.platform,
      status: SARAMIN_JOB_DEFAULTS.status,
      title,
      url,
    };
  }
}

function extractSaraminData($: CheerioAPI): {
  companyName?: string;
  title?: string;
  url?: string;
} {
  const result: {
    companyName?: string;
    title?: string;
    url?: string;
  } = {};

  parseJobPostingJsonLd($, (item) => {
    const organization = isJsonRecord(item.hiringOrganization)
      ? item.hiringOrganization
      : undefined;

    result.title = asNonEmptyString(item.title);
    result.companyName = asNonEmptyString(organization?.name);
    result.url = asNonEmptyString(item.url);
  });

  return result;
}

function parseSaraminIdFromUrl(url: string): string | undefined {
  for (const pattern of SARAMIN_ID_PATTERNS) {
    const matched = url.match(pattern);
    if (matched?.[1]) {
      return matched[1];
    }
  }

  return undefined;
}
