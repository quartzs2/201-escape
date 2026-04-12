"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  identifyUser,
  preloadPostHog,
  resetPostHog,
  trackPageView,
} from "./client";

export function DeferredPostHogBootstrap() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldBootstrap, setShouldBootstrap] = useState(false);

  useEffect(() => {
    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(
        () => {
          preloadPostHog();
          setShouldBootstrap(true);
        },
        { timeout: 1500 },
      );

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      preloadPostHog();
      setShouldBootstrap(true);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!shouldBootstrap) {
      return;
    }

    const query = searchParams.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;

    trackPageView(currentUrl);
  }, [pathname, searchParams, shouldBootstrap]);

  useEffect(() => {
    if (!shouldBootstrap) {
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        identifyUser(session.user.id, { email: session.user.email });
        return;
      }

      resetPostHog();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [shouldBootstrap]);

  return null;
}
