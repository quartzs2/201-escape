const isProd = process.env.NODE_ENV === "production";
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const shouldEnableBrowserSentry =
  process.env.NEXT_PUBLIC_ENABLE_BROWSER_SENTRY === "true" &&
  typeof window !== "undefined" &&
  typeof sentryDsn === "string" &&
  sentryDsn.length > 0;

if (shouldEnableBrowserSentry) {
  const initializeBrowserSentry = () => {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.init({
        dsn: sentryDsn,
        enableLogs: !isProd,
        tracesSampleRate: isProd ? 0.1 : 1.0,
      });
    });
  };

  if (document.readyState === "complete") {
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      requestIdle(
        () => {
          initializeBrowserSentry();
        },
        { timeout: 2000 },
      );
    } else {
      window.setTimeout(() => {
        initializeBrowserSentry();
      }, 500);
    }
  } else {
    window.addEventListener("load", initializeBrowserSentry, { once: true });
  }
}

export function onRouterTransitionStart() {}
