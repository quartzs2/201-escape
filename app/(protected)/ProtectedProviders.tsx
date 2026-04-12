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

export function ProtectedProviders({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <>
      {children}
      {shouldMount && <SentryUserSync />}
    </>
  );
}
