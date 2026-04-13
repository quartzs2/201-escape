"server-only";

import { after } from "next/server";
import { PostHog } from "posthog-node";

import type { AnalyticsEvent } from "./events";

const POSTHOG_TOKEN = process.env.POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.POSTHOG_HOST;

let _client: null | PostHog = null;

export function trackServerEvent(
  distinctId: string,
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
): void {
  const client = getPostHogClient();

  if (!client) {
    return;
  }

  client.capture({ distinctId, event, properties });

  after(async () => {
    await client.flush();
  });
}

function getPostHogClient(): null | PostHog {
  if (!POSTHOG_TOKEN || !POSTHOG_HOST) {
    return null;
  }

  if (!_client) {
    _client = new PostHog(POSTHOG_TOKEN, { host: POSTHOG_HOST });
  }

  return _client;
}
