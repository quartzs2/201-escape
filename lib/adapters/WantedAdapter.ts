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
import { JobId, JobPost, WANTED_JOB_DEFAULTS } from "@/lib/types/job";

const WANTED_ID_PATTERNS = [
  /wanted\.co\.kr\/wd\/(\d+)/i,
  /wanted\.co\.kr\/jobs\/(\d+)/i,
  /\/(\d+)(?:\?|$)/,
];

const WANTED_TITLE_SELECTORS = [
  "h1[class*='JobHeader']",
  "h1[class*='JobContent']",
  "h1",
];

const WANTED_COMPANY_SELECTORS = [
  "[data-cy='job-company-name']",
  "a[href*='/company/']",
  "[class*='company'] [class*='name']",
];

export class WantedAdapter extends BaseAdapter {
  async fetch(url: string): Promise<unknown> {
    const html = await fetchHtml(url);
    const $ = load(html);

    const extracted = extractWantedData($);
    const title = getFirstString([
      extracted.title,
      getMetaContent($, "meta[property='og:title']"),
      getMetaContent($, "meta[name='twitter:title']"),
      getFirstTextBySelectors($, WANTED_TITLE_SELECTORS),
    ]);
    const companyName = getFirstString([
      extracted.companyName,
      getMetaContent($, "meta[property='og:site_name']"),
      getFirstTextBySelectors($, WANTED_COMPANY_SELECTORS),
    ]);

    return {
      company_name: companyName,
      id: getFirstString([extracted.id, parseWantedIdFromUrl(url)]),
      title,
      url: getFirstString([extracted.url, url]),
    };
  }

  supports(url: string): boolean {
    return url.includes(RECRUIT_SITE_URLS.WANTED);
  }

  override transform(rawContent: unknown): JobPost {
    const wantedRawSchema = z.object({
      company: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
      company_name: z.string().optional(),
      id: z.union([z.string(), z.number()]).optional(),
      job_title: z.string().optional(),
      title: z.string().optional(),
      url: z.string().optional(),
    });

    const parsed = wantedRawSchema.safeParse(rawContent);
    const data = parsed.success ? parsed.data : {};

    const id = (data.id?.toString() as JobId) ?? (crypto.randomUUID() as JobId);
    const title = data.title ?? data.job_title ?? WANTED_JOB_DEFAULTS.title;
    const companyName =
      data.company_name ??
      data.company?.name ??
      WANTED_JOB_DEFAULTS.companyName;

    return {
      appliedDate: new Date().toISOString(),
      companyName,
      id,
      platform: WANTED_JOB_DEFAULTS.platform,
      status: WANTED_JOB_DEFAULTS.status,
      title,
      url: data.url ?? WANTED_JOB_DEFAULTS.url,
    };
  }
}

function extractWantedData($: CheerioAPI): {
  companyName?: string;
  id?: string;
  title?: string;
  url?: string;
} {
  const result: {
    companyName?: string;
    id?: string;
    title?: string;
    url?: string;
  } = {};

  parseJobPostingJsonLd($, (item) => {
    const organization = isJsonRecord(item.hiringOrganization)
      ? item.hiringOrganization
      : undefined;

    result.id = getFirstString([
      getIdentifierValue(item.identifier),
      getIdentifierValue(item.id),
    ]);
    result.title = asNonEmptyString(item.title);
    result.companyName = asNonEmptyString(organization?.name);
    result.url = asNonEmptyString(item.url);
  });

  return result;
}

function getIdentifierValue(identifier: unknown): string | undefined {
  if (typeof identifier === "number") {
    return identifier.toString();
  }

  if (typeof identifier === "string") {
    return asNonEmptyString(identifier);
  }

  if (!isJsonRecord(identifier)) {
    return undefined;
  }

  return getFirstString([
    asNonEmptyString(identifier.value),
    asNonEmptyString(identifier["@id"]),
    asNonEmptyString(identifier.id),
  ]);
}

function parseWantedIdFromUrl(url: string): string | undefined {
  for (const pattern of WANTED_ID_PATTERNS) {
    const matched = url.match(pattern);
    if (matched?.[1]) {
      return matched[1];
    }
  }

  return undefined;
}
