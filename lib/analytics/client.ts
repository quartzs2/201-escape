"use client";

import type { AnalyticsEvent } from "./events";

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({ event, properties });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", payload);
    return;
  }

  void fetch("/api/events", {
    body: payload,
    keepalive: true,
    method: "POST",
  });
}
