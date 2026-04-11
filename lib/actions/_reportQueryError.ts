import * as Sentry from "@sentry/nextjs";

export function reportQueryError(actionName: string, reason: string): void {
  const error = new Error(`[${actionName}] QUERY_ERROR: ${reason}`);
  error.name = "QueryError";
  Sentry.withScope((scope) => {
    scope.setTag("action", actionName);
    scope.setExtra("reason", reason);
    Sentry.captureException(error);
  });
}
