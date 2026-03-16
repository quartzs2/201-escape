export const AUTH_ERROR_CODE = "28000";

export type QueryErrorLike = {
  code?: string;
  details?: null | string;
  hint?: null | string;
  message: string;
};

export function normalizeQueryError(error: QueryErrorLike): string {
  const metadata = [error.details, error.hint].filter(Boolean).join(" | ");

  if (metadata.length > 0) {
    return `${error.message} (${metadata})`;
  }

  return error.message;
}
