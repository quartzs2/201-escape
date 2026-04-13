"use server";

import { redirect } from "next/navigation";

import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackServerEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    trackServerEvent(user.id, ANALYTICS_EVENTS.LOGOUT_CLICKED);
  }

  await supabase.auth.signOut();

  redirect("/");
}
