export const runtime = "edge";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const host = forwardedHost ?? new URL(request.url).hostname;
      const isLocalhost = host.split(":")[0] === "localhost";
      const redirectOrigin = isLocalhost
        ? `http://localhost:3000`
        : `https://${host}`;
      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

function getSafeRedirectPath(raw: null | string): string {
  if (!raw) {
    return "/";
  }
  try {
    const url = new URL(raw, "http://localhost");
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}
