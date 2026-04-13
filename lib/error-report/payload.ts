export const ERROR_REPORT_MESSAGE_MAX_LENGTH = 500;
export const ERROR_REPORT_DIGEST_MAX_LENGTH = 200;

export type ErrorReportPayload = {
  digest?: string;
  message: string;
};

export function createErrorReportPayload(input: {
  digest?: string;
  message: string;
}): ErrorReportPayload {
  const message = input.message
    .trim()
    .slice(0, ERROR_REPORT_MESSAGE_MAX_LENGTH);
  const digest = normalizeOptionalString(
    input.digest,
    ERROR_REPORT_DIGEST_MAX_LENGTH,
  );

  if (digest) {
    return { digest, message };
  }

  return { message };
}

export function parseErrorReportPayload(
  input: unknown,
): ErrorReportPayload | null {
  if (!isRecord(input)) {
    return null;
  }

  const message = normalizeRequiredString(
    input.message,
    ERROR_REPORT_MESSAGE_MAX_LENGTH,
  );

  if (!message) {
    return null;
  }

  const digest = normalizeOptionalString(
    input.digest,
    ERROR_REPORT_DIGEST_MAX_LENGTH,
  );

  if (digest) {
    return { digest, message };
  }

  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.slice(0, maxLength);
}

function normalizeRequiredString(
  value: unknown,
  maxLength: number,
): null | string {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length > maxLength) {
    return null;
  }

  return trimmedValue;
}
