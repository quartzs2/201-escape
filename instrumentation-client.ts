import * as Sentry from "@sentry/nextjs";

const hasSentryDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: hasSentryDsn,
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
