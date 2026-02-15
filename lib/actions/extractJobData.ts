"use server";

import { isIP } from "node:net";

import { AdapterFactory } from "@/lib/adapters/AdapterFactory";
import { EXTRACT_JOB_MAX_URL_LENGTH } from "@/lib/constants/extract-job";
import { RECRUIT_SITE_URL_LIST } from "@/lib/constants/recruit-sites";
import { JobPost } from "@/lib/types/job";
import { z } from "zod";

const INVALID_URL_REASON = "Invalid URL format.";
const NOT_ALLOWED_DOMAIN_REASON = "Only wanted.co.kr and saramin.co.kr are supported.";
const BLOCKED_HOST_REASON = "Private or local network hosts are not allowed.";
const UNKNOWN_ERROR_MESSAGE = "Unknown error";

const BLOCKED_HOSTNAME_SET = new Set(["localhost", "localhost.localdomain"]);

const extractUrlSchema = z
  .string()
  .trim()
  .max(EXTRACT_JOB_MAX_URL_LENGTH)
  .pipe(z.url());

export type ExtractJobDataResult =
  | { ok: true; data: JobPost }
  | { ok: false; reason: string };

type UrlValidationResult =
  | { ok: true; value: URL }
  | { ok: false; reason: string };

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

function validateExtractUrl(rawUrl: string): UrlValidationResult {
  const parsedUrl = extractUrlSchema.safeParse(rawUrl);
  if (!parsedUrl.success) {
    return {
      ok: false,
      reason: INVALID_URL_REASON,
    };
  }

  const url = new URL(parsedUrl.data);
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

  return {
    ok: true,
    value: url,
  };
}

export async function extractJobData(url: string): Promise<ExtractJobDataResult> {
  const validatedUrlResult = validateExtractUrl(url);
  if (!validatedUrlResult.ok) {
    return validatedUrlResult;
  }

  try {
    const data = await AdapterFactory.extractFromUrl(validatedUrlResult.value.toString());
    return {
      ok: true,
      data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return {
      ok: false,
      reason: `Failed to extract job data: ${message}`,
    };
  }
}
