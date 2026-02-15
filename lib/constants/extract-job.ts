export const EXTRACT_JOB_REQUEST_TIMEOUT_MS = 8000;
export const EXTRACT_JOB_MAX_RETRY_COUNT = 1;
export const EXTRACT_JOB_RETRY_DELAY_MS = 400;
export const EXTRACT_JOB_MAX_URL_LENGTH = 2048;
export const EXTRACT_JOB_MAX_REDIRECT_COUNT = 5;

export const EXTRACT_JOB_REQUEST_HEADERS = {
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
} as const;
