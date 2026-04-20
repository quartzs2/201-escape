const hasSentryDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
const shouldLoadSentry = process.env.NODE_ENV === "production" && hasSentryDsn;

type RouterTransitionType = "push" | "replace" | "traverse";
type SentryClientModule = typeof import("@sentry/nextjs");

let sentryClientModulePromise: null | Promise<null | SentryClientModule> = null;

function loadSentryClient() {
  if (!shouldLoadSentry) {
    return null;
  }

  if (sentryClientModulePromise) {
    return sentryClientModulePromise;
  }

  sentryClientModulePromise = import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        enabled: true,
        sendDefaultPii: false,
      });

      return Sentry;
    })
    .catch(() => null);

  return sentryClientModulePromise;
}

function scheduleSentryInit() {
  if (!shouldLoadSentry || typeof window === "undefined") {
    return;
  }

  const startWhenIdle = () => {
    const requestIdleCallback =
      "requestIdleCallback" in globalThis
        ? globalThis.requestIdleCallback
        : null;

    if (requestIdleCallback) {
      requestIdleCallback(
        () => {
          void loadSentryClient();
        },
        { timeout: 2000 },
      );
      return;
    }

    globalThis.setTimeout(() => {
      void loadSentryClient();
    }, 0);
  };

  if (document.readyState === "complete") {
    startWhenIdle();
    return;
  }

  window.addEventListener("load", startWhenIdle, { once: true });
}

scheduleSentryInit();

export function onRouterTransitionStart(
  url: string,
  navigationType: RouterTransitionType,
) {
  void loadSentryClient()?.then((Sentry) => {
    Sentry?.captureRouterTransitionStart(url, navigationType);
  });
}
