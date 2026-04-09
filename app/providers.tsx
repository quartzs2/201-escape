"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip/Tooltip";
import { PostHogProvider } from "@/lib/posthog/PostHogProvider";
import { PostHogUserSync } from "@/lib/posthog/PostHogUserSync";
import { SentryUserSync } from "@/lib/sentry/SentryUserSync";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <SentryUserSync />
        <PostHogUserSync />
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
