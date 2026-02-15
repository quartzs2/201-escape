import {
  EXTRACT_JOB_MAX_RETRY_COUNT,
  EXTRACT_JOB_REQUEST_HEADERS,
  EXTRACT_JOB_REQUEST_TIMEOUT_MS,
  EXTRACT_JOB_RETRY_DELAY_MS,
} from "@/lib/constants/extract-job";

const RETRY_BACKOFF_MULTIPLIER = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= EXTRACT_JOB_MAX_RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, EXTRACT_JOB_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: EXTRACT_JOB_REQUEST_HEADERS,
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch url: ${response.status}`);
      }

      const html = await response.text();
      if (html.trim().length === 0) {
        throw new Error("Fetched HTML is empty.");
      }

      clearTimeout(timeout);
      return html;
    } catch (error) {
      clearTimeout(timeout);
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
