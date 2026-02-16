import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";

import { EXTRACT_JOB_MAX_URL_LENGTH } from "@/lib/constants/extract-job";
import { RECRUIT_SITE_URL_LIST } from "@/lib/constants/recruit-sites";

export const INVALID_URL_REASON = "Invalid URL format.";
export const NOT_ALLOWED_DOMAIN_REASON = "Only wanted.co.kr and saramin.co.kr are supported.";
export const BLOCKED_HOST_REASON = "Private or local network hosts are not allowed.";

const BLOCKED_HOSTNAME_SET = new Set(["localhost", "localhost.localdomain"]);
const ALLOWED_PROTOCOL_SET = new Set(["http:", "https:"]);

const urlSchema = z
  .string()
  .trim()
  .max(EXTRACT_JOB_MAX_URL_LENGTH)
  .pipe(z.url());

export type UrlValidationResult =
  | { ok: false; reason: string }
  | { ok: true; value: URL };

export async function validateSafeUrl(rawUrl: string): Promise<UrlValidationResult> {
  const parsedUrl = urlSchema.safeParse(rawUrl);
  if (!parsedUrl.success) {
    return {
      ok: false,
      reason: INVALID_URL_REASON,
    };
  }

  const url = new URL(parsedUrl.data);
  if (!ALLOWED_PROTOCOL_SET.has(url.protocol)) {
    return {
      ok: false,
      reason: INVALID_URL_REASON,
    };
  }

  const hostname = url.hostname.toLowerCase();

  if (!isAllowedRecruitHost(hostname)) {
    return {
      ok: false,
      reason: NOT_ALLOWED_DOMAIN_REASON,
    };
  }

  if (isBlockedHost(hostname)) {
    return {
      ok: false,
      reason: BLOCKED_HOST_REASON,
    };
  }

  if (await hasBlockedResolvedAddress(hostname)) {
    return {
      ok: false,
      reason: BLOCKED_HOST_REASON,
    };
  }

  return {
    ok: true,
    value: url,
  };
}

async function hasBlockedResolvedAddress(hostname: string): Promise<boolean> {
  const normalizedHost = hostname.toLowerCase();
  const ipVersion = isIP(normalizedHost);
  if (ipVersion !== 0) {
    return isBlockedHost(normalizedHost);
  }

  try {
    const records = await lookup(normalizedHost, {
      all: true,
      verbatim: true,
    });

    if (records.length === 0) {
      return true;
    }

    for (const record of records) {
      if (isBlockedHost(record.address)) {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}

function isAllowedRecruitHost(hostname: string): boolean {
  const normalizedHost = hostname.toLowerCase();

  for (const recruitHost of RECRUIT_SITE_URL_LIST) {
    if (
      normalizedHost === recruitHost ||
      normalizedHost.endsWith(`.${recruitHost}`)
    ) {
      return true;
    }
  }

  return false;
}

function isBlockedHost(hostname: string): boolean {
  const normalizedHost = hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAME_SET.has(normalizedHost) ||
    normalizedHost.endsWith(".local")
  ) {
    return true;
  }

  const ipVersion = isIP(normalizedHost);
  if (ipVersion === 4) {
    return isBlockedIpv4(normalizedHost);
  }

  if (ipVersion === 6) {
    return isBlockedIpv6(normalizedHost);
  }

  return false;
}

function isBlockedIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map((part) => Number(part));
  if (octets.some((octet) => Number.isNaN(octet))) {
    return false;
  }

  const firstOctet = octets[0];
  const secondOctet = octets[1];

  if (firstOctet === 10 || firstOctet === 127) {
    return true;
  }

  if (firstOctet === 169 && secondOctet === 254) {
    return true;
  }

  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) {
    return true;
  }

  if (firstOctet === 192 && secondOctet === 168) {
    return true;
  }

  return false;
}

function isBlockedIpv6(hostname: string): boolean {
  const normalizedHost = hostname.toLowerCase();

  // IPv4-mapped IPv6 address (e.g., ::ffff:127.0.0.1)
  if (normalizedHost.startsWith("::ffff:")) {
    const ipv4Part = normalizedHost.substring(7);
    if (isIP(ipv4Part) === 4) {
      return isBlockedIpv4(ipv4Part);
    }
  }

  if (
    normalizedHost === "::1" ||
    normalizedHost.startsWith("fc") ||
    normalizedHost.startsWith("fd") ||
    normalizedHost.startsWith("fe80:")
  ) {
    return true;
  }

  return false;
}
