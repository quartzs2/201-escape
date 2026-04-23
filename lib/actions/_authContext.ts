import "server-only";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import { getAuthenticatedUserId } from "./_auth";

const AUTH_REQUIRED_REASON = "로그인이 필요합니다.";

export type AuthContextResult =
  | { accessToken: string; ok: true; userId: string }
  | { ok: false; reason: string };

export const getAuthContext = cache(async (): Promise<AuthContextResult> => {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    return { ok: false, reason: AUTH_REQUIRED_REASON };
  }

  const authResult = await getAuthenticatedUserId(supabase, accessToken);

  if (!authResult.ok) {
    return { ok: false, reason: authResult.reason };
  }

  return { accessToken, ok: true, userId: authResult.userId };
});
