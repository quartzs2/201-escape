"use client";

import { useState } from "react";

import GoogleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button/Button";
import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleGoogleLogin = async () => {
    trackEvent(ANALYTICS_EVENTS.LOGIN_ATTEMPTED);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const url = new URL("/auth/callback", window.location.origin);
      url.searchParams.set("next", "/dashboard");

      const { error } = await supabase.auth.signInWithOAuth({
        options: {
          redirectTo: url.toString(),
        },
        provider: "google",
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch {
      setErrorMessage("로그인을 시작할 수 없습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        aria-busy={isLoading}
        className="h-auto w-full gap-3 rounded-2xl border-border/60 bg-background px-4 py-4 text-[15px] font-bold text-foreground hover:border-primary/20 hover:bg-muted/30 active:scale-[0.98] disabled:opacity-60"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        variant="outline"
      >
        <GoogleIcon aria-hidden="true" className="h-5 w-5" />
        <span>{isLoading ? "로그인 중..." : "Google로 계속하기"}</span>
      </Button>

      {errorMessage && (
        <p
          className="px-1 text-center text-sm font-medium text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </>
  );
}
