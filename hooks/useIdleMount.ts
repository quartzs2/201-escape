"use client";

import { useEffect, useState } from "react";

type UseIdleMountOptions = {
  fallbackDelayMs?: number;
  timeoutMs?: number;
};

export function useIdleMount(options: UseIdleMountOptions = {}) {
  const { fallbackDelayMs = 400, timeoutMs = 1200 } = options;
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(
        () => {
          setShouldMount(true);
        },
        { timeout: timeoutMs },
      );

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setShouldMount(true);
    }, fallbackDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fallbackDelayMs, timeoutMs]);

  return shouldMount;
}
