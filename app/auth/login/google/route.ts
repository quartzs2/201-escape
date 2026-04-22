import { NextResponse } from "next/server";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { isLikelyWebViewUserAgent } from "@/lib/auth/webview";
import { createClient } from "@/lib/supabase/server";

const CALLBACK_PATH = "/auth/callback";
const DASHBOARD_PATH = "/dashboard";
const ERROR_PATH = "/auth/auth-code-error";
const LOGIN_PATH = "/login";
const WEBVIEW_QUERY_VALUE = "1";

export async function GET(request: Request): Promise<NextResponse> {
  const { origin } = new URL(request.url);
  const userAgent = request.headers.get("user-agent") ?? "";

  if (isLikelyWebViewUserAgent(userAgent)) {
    const loginUrl = new URL(LOGIN_PATH, origin);
    loginUrl.searchParams.set("webview", WEBVIEW_QUERY_VALUE);

    return NextResponse.redirect(loginUrl, 302);
  }

  const supabase = await createClient();
  const redirectTo = new URL(CALLBACK_PATH, origin);
  redirectTo.searchParams.set("next", DASHBOARD_PATH);

  trackServerEvent("anonymous", ANALYTICS_EVENTS.LOGIN_ATTEMPTED);

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: redirectTo.toString(),
    },
    provider: "google",
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL(ERROR_PATH, origin), 302);
  }

  return NextResponse.redirect(data.url, 302);
}
