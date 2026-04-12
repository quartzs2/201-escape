const isProd = process.env.NODE_ENV === "production";
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const PUBLIC_BROWSER_SENTRY_DISABLED_PATHS = new Set(["/", "/privacy"]);
const shouldEnableBrowserSentry =
  process.env.NEXT_PUBLIC_ENABLE_BROWSER_SENTRY === "true" &&
  typeof window !== "undefined" &&
  typeof sentryDsn === "string" &&
  sentryDsn.length > 0 &&
  !PUBLIC_BROWSER_SENTRY_DISABLED_PATHS.has(window.location.pathname);

if (shouldEnableBrowserSentry) {
  const initializeBrowserSentry = () => {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.init({
        dsn: sentryDsn,
        enableLogs: !isProd,
        tracesSampleRate: 0,
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
