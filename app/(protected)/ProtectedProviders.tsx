"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SentryUserSync = dynamic(
  () =>
    import("@/lib/sentry/SentryUserSync").then((mod) => ({
      default: mod.SentryUserSync,
    })),
  { ssr: false },
);

const DeferredPostHogBootstrap = dynamic(
  () =>
    import("@/lib/posthog/DeferredPostHogBootstrap").then((mod) => ({
      default: mod.DeferredPostHogBootstrap,
    })),
  { ssr: false },
);

const BottomTabBar = dynamic(
  () =>
    import("./_components/BottomTabBar").then((mod) => ({
      default: mod.BottomTabBar,
    })),
  { ssr: false },
);

const WindowScrollTopFAB = dynamic(
  () =>
    import("./_components/WindowScrollTopFAB").then((mod) => ({
      default: mod.WindowScrollTopFAB,
    })),
  { ssr: false },
);

export function ProtectedEnhancements() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(
        () => {
          setShouldMount(true);
        },
        { timeout: 1200 },
      );

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setShouldMount(true);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!shouldMount) {
    return null;
  }

  return (
    <>
      <DeferredPostHogBootstrap />
      <BottomTabBar />
      <WindowScrollTopFAB />
      <SentryUserSync />
    </>
  );
}
