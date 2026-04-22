import {
  captureClientRouterTransitionStart,
  scheduleSentryClientInit,
} from "@/lib/sentry/client";

type RouterTransitionType = "push" | "replace" | "traverse";

scheduleSentryClientInit();

export function onRouterTransitionStart(
  url: string,
  navigationType: RouterTransitionType,
) {
  captureClientRouterTransitionStart(url, navigationType);
}
