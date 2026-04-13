import * as Sentry from "@sentry/nextjs";

import { parseErrorReportPayload } from "@/lib/error-report/payload";

export async function POST(req: Request): Promise<Response> {
  let payload: ReturnType<typeof parseErrorReportPayload>;

  try {
    payload = parseErrorReportPayload(await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!payload) {
    return new Response(null, { status: 400 });
  }

  const error = new Error(payload.message);
  error.name = "ClientError";

  Sentry.withScope((scope) => {
    if (payload.digest) {
      scope.setTag("digest", payload.digest);
    }
    scope.setTag("source", "global-error");
    Sentry.captureException(error);
  });

  return new Response(null, { status: 204 });
}
