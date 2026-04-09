"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageleave: true,
    capture_pageview: false,
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    const search = searchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;

    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}
