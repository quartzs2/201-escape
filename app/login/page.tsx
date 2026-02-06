"use client";

import { useState } from "react";

import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { ROUTES } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();

    const url = new URL(ROUTES.AUTH.CALLBACK, window.location.origin);
    url.searchParams.set("next", ROUTES.HOME);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: url.toString(),
      },
    });

    if (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            반가워요!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            201 escape에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="mt-8">
          <button
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            type="button"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>{isLoading ? "로그인 중..." : "Google로 계속하기"}</span>
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
