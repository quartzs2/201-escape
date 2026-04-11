"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export function PostHogUserSync() {
  const posthog = usePostHog();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
      } else {
        posthog.reset();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [posthog]);

  return null;
}
