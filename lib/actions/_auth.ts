"server-only";

import type { createClient } from "@/lib/supabase/server";

import { trackAuthenticatedUserActivity } from "@/lib/analytics/server";

const AUTH_REQUIRED_REASON = "로그인이 필요합니다.";

type AuthenticatedUserIdResult =
  | {
      ok: false;
      reason: string;
    }
  | {
      ok: true;
      userId: string;
    };

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getAuthenticatedUserId(
  supabase: ServerSupabaseClient,
): Promise<AuthenticatedUserIdResult> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || userId.length === 0) {
    return { ok: false, reason: AUTH_REQUIRED_REASON };
  }

  trackAuthenticatedUserActivity(userId);

  return { ok: true, userId };
}
