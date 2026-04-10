"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PostHogProvider } from "@/lib/posthog/PostHogProvider";
import { PostHogUserSync } from "@/lib/posthog/PostHogUserSync";

export function ApplicationsProviders({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <PostHogUserSync />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PostHogProvider>
  );
}
