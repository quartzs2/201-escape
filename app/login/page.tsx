"use client";

import { useState } from "react";

import GoogleIcon from "@/assets/google.svg";
import { createClient } from "@/lib/supabase/client";

import { PublicHeader } from "../_components/PublicHeader";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();

    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", "/");

    const { error } = await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: url.toString(),
      },
      provider: "google",
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
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
          </div>
        </div>
      </div>
    </div>
  );
}
