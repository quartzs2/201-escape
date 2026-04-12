"use client";

import type { Properties } from "posthog-js";

const POSTHOG_OPTIONS = {
  advanced_disable_decide: true,
  advanced_disable_feature_flags: true,
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  autocapture: false,
  capture_pageleave: false,
  capture_pageview: false,
  disable_external_dependency_loading: true,
  disable_session_recording: true,
  disable_surveys: true,
} as const;

let initPromise: null | Promise<typeof import("posthog-js")> = null;

export function identifyUser(userId: string, properties?: Properties) {
  void getPostHogModule().then((module) => {
    module?.default.identify(userId, properties);
  });
}

export function preloadPostHog() {
  void getPostHogModule();
}

export function resetPostHog() {
  void getPostHogModule().then((module) => {
    module?.default.reset();
  });
}

export function trackEvent(eventName: string, properties?: Properties) {
  void getPostHogModule().then((module) => {
    module?.default.capture(eventName, properties);
  });
}

export function trackPageView(currentUrl: string) {
  void getPostHogModule().then((module) => {
    module?.default.capture("$pageview", { $current_url: currentUrl });
  });
}

function canUsePostHog() {
  return (
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_POSTHOG_HOST &&
    !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
}

async function getPostHogModule() {
  if (!canUsePostHog()) {
    return null;
  }

  if (!initPromise) {
    initPromise = import("posthog-js").then((module) => {
      module.default.init(
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,
        POSTHOG_OPTIONS,
      );
      return module;
    });
  }

  return initPromise;
}
