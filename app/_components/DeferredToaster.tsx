"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SonnerToaster = dynamic(
  () => import("sonner").then((mod) => ({ default: mod.Toaster })),
  { ssr: false },
);

export function DeferredToaster() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(
        () => {
          setShouldRender(true);
        },
        { timeout: 1500 },
      );

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(true);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return <SonnerToaster position="bottom-center" richColors />;
}
