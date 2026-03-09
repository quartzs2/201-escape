import { validateSafeUrl } from "@/lib/adapters/utils/url-validator";
import {
  EXTRACT_JOB_MAX_REDIRECT_COUNT,
  EXTRACT_JOB_MAX_RETRY_COUNT,
  EXTRACT_JOB_REQUEST_HEADERS,
  EXTRACT_JOB_REQUEST_TIMEOUT_MS,
  EXTRACT_JOB_RETRY_DELAY_MS,
} from "@/lib/constants/extract-job";

const RETRY_BACKOFF_MULTIPLIER = 1;

/**
 * URL에서 HTML을 가져옵니다. SSRF 방지를 위해 리다이렉트를 수동으로 처리하고 검증합니다.
 */
export async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= EXTRACT_JOB_MAX_RETRY_COUNT; attempt += 1) {
    try {
      return await fetchWithManualRedirect(url);
    } catch (error) {
      lastError = error;

      if (attempt === EXTRACT_JOB_MAX_RETRY_COUNT) {
        break;
      }

      const retryDelay =
        EXTRACT_JOB_RETRY_DELAY_MS * (attempt + RETRY_BACKOFF_MULTIPLIER);
      await sleep(retryDelay);
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown";
  throw new Error(`Failed to fetch html content: ${message}`);
}

/**
 * 리다이렉트를 수동으로 처리하며 매 단계마다 안전한 URL인지 검증합니다.
 */
async function fetchWithManualRedirect(initialUrl: string): Promise<string> {
  let currentUrl = initialUrl;
  let redirectCount = 0;

  while (redirectCount <= EXTRACT_JOB_MAX_REDIRECT_COUNT) {
    const validated = await validateSafeUrl(currentUrl);
    if (!validated.ok) {
      throw new Error(`Insecure redirect or URL blocked: ${validated.reason}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, EXTRACT_JOB_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        headers: EXTRACT_JOB_REQUEST_HEADERS,
        redirect: "manual",
        signal: controller.signal,
      });

      // 리다이렉트 처리 (301, 302, 303, 307, 308)
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error(`Redirect status ${response.status} received without location header.`);
        }

        // 상대 경로 처리
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount += 1;
        continue;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch url: ${response.status}`);
      }

      const html = await response.text();
      if (html.trim().length === 0) {
        throw new Error("Fetched HTML is empty.");
      }

      return html;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Too many redirects (max: ${EXTRACT_JOB_MAX_REDIRECT_COUNT})`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
