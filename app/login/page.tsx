"use client";

import type { Route } from "next";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import GoogleIcon from "@/assets/google.svg";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { PostHogProvider } from "@/lib/posthog/PostHogProvider";

import { PublicHeader } from "../_components/PublicHeader";

const PRIVACY_PAGE_HREF = "/privacy" as Route;

export default function LoginPage() {
  return (
    <PostHogProvider>
      <LoginPageContent />
    </PostHogProvider>
  );
}

function LoginPageContent() {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleGoogleLogin = async () => {
    posthog.capture(POSTHOG_EVENTS.LOGIN_ATTEMPTED);
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
    <div className="flex h-dvh flex-col bg-muted/30">
      <PublicHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-20">
        <div className="w-full max-w-sm rounded-[32px] border border-border/50 bg-background p-10 shadow-xl shadow-black/[0.03]">
          <header className="mb-10 text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
              Welcome
            </span>
            <h1 className="mt-3 text-[32px] font-extrabold tracking-tight text-foreground">
              로그인
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              201 escape에 오신 것을 환영합니다.
            </p>
          </header>

          <div className="space-y-4">
            <button
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-4 text-[15px] font-bold text-foreground transition-all hover:border-primary/20 hover:bg-muted/30 active:scale-[0.98]"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              type="button"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>{isLoading ? "로그인 중..." : "Google로 계속하기"}</span>
            </button>

            {errorMessage && (
              <p className="px-1 text-center text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-center px-1">
              <p className="inline-flex flex-wrap items-center justify-center gap-x-1 text-center text-xs leading-5 text-muted-foreground">
                <span>계속 진행하면</span>
                <Link
                  className="font-semibold text-primary underline underline-offset-4"
                  href={PRIVACY_PAGE_HREF}
                >
                  개인정보처리방침
                </Link>
                <span>에 동의한 것으로 간주됩니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
