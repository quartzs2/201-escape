import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

const VALID_EVENTS = new Set<string>(Object.values(ANALYTICS_EVENTS));

export async function POST(req: Request): Promise<Response> {
  let event: string;
  let properties: Record<string, unknown> | undefined;

  try {
    const body = await req.json();
    event = body.event;
    properties =
      body.properties !== undefined &&
      typeof body.properties === "object" &&
      body.properties !== null
        ? (body.properties as Record<string, unknown>)
        : undefined;
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof event !== "string" || !VALID_EVENTS.has(event)) {
    return new Response(null, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  trackServerEvent(
    user?.id ?? "anonymous",
    event as AnalyticsEvent,
    properties,
  );

  return new Response(null, { status: 204 });
}
