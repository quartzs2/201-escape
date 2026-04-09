"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export function SentryUserSync() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        Sentry.setUser({ id: session.user.id });
      } else {
        Sentry.setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
