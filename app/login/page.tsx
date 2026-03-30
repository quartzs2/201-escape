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
    <div className="flex h-dvh flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col justify-center px-5 pb-8">
        <p className="text-sm text-muted-foreground">반가워요!</p>
        <h1 className="mt-0.5 text-3xl text-foreground">로그인</h1>
        <p className="mt-2 text-muted-foreground">
          201 escape에 오신 것을 환영합니다.
        </p>
        <div className="mt-8">
          <button
            className="group relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            type="button"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>{isLoading ? "로그인 중..." : "Google로 계속하기"}</span>
          </button>
        </div>
        {errorMessage && (
          <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
