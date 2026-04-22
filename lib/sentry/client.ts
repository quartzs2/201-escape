"use client";

type RouterTransitionType = "push" | "replace" | "traverse";
type SentryClientModule = typeof import("@sentry/nextjs");
type SentryScope = {
  setExtra: (key: string, extra: unknown) => void;
  setTag: (key: string, value: string) => void;
};

const hasSentryDsn = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
const isBrowserSentryEnabled =
  process.env.NEXT_PUBLIC_ENABLE_BROWSER_SENTRY === "true";
const shouldLoadSentry =
  process.env.NODE_ENV === "production" &&
  hasSentryDsn &&
  isBrowserSentryEnabled;

let sentryClientModulePromise: null | Promise<null | SentryClientModule> = null;

export function captureClientException(
  error: unknown,
  configureScope?: (scope: SentryScope) => void,
) {
  void loadSentryClient()?.then((Sentry) => {
    if (!Sentry) {
      return;
    }

    if (!configureScope) {
      Sentry.captureException(error);
      return;
    }

    Sentry.withScope((scope) => {
      configureScope(scope);
      Sentry.captureException(error);
    });
  });
}

export function captureClientRouterTransitionStart(
  url: string,
  navigationType: RouterTransitionType,
) {
  void url;
  void navigationType;

  return;
}

export function scheduleSentryClientInit() {
  if (!shouldLoadSentry || typeof window === "undefined") {
    return;
  }

  const scheduleAfterLoad = () => {
    startWhenIdle(() => {
      void loadSentryClient();
    });
  };

  if (document.readyState === "complete") {
    scheduleAfterLoad();
    return;
  }

  window.addEventListener("load", scheduleAfterLoad, { once: true });
}

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
        replaysOnErrorSampleRate: 0,
        replaysSessionSampleRate: 0,
        sendDefaultPii: false,
        tracesSampleRate: 0,
      });

      return Sentry;
    })
    .catch(() => null);

  return sentryClientModulePromise;
}

function startWhenIdle(callback: () => void) {
  const requestIdleCallback =
    "requestIdleCallback" in globalThis ? globalThis.requestIdleCallback : null;

  if (requestIdleCallback) {
    requestIdleCallback(callback, { timeout: 3000 });
    return;
  }

  globalThis.setTimeout(callback, 1500);
  return;
}
