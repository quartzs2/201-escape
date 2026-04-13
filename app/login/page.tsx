"use client";

import type { Route } from "next";

import Link from "next/link";
import { useState } from "react";

import GoogleIcon from "@/assets/google.svg";
import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

import { PublicHeader } from "../_components/PublicHeader";
import styles from "./page.module.css";

const PRIVACY_PAGE_HREF = "/privacy" as Route;

export default function LoginPage() {
  return <LoginPageContent />;
}

function LoginPageContent() {
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
      <div className={styles.page}>
        <PublicHeader />
        <div className={styles.body}>
          <div className={styles.card}>
            <header className={styles.cardHeader}>
              <span className={styles.eyebrow}>Welcome</span>
              <h1 className={styles.title}>로그인</h1>
              <p className={styles.subtitle}>
                201 escape에 오신 것을 환영합니다.
              </p>
            </header>

            <div className={styles.content}>
              <button
                className={styles.googleButton}
                disabled={isLoading}
                onClick={handleGoogleLogin}
                type="button"
              >
                <GoogleIcon className={styles.googleIcon} />
                <span>{isLoading ? "로그인 중..." : "Google로 계속하기"}</span>
              </button>

              {errorMessage && (
                <p className={styles.errorMessage}>{errorMessage}</p>
              )}

              <div className={styles.policy}>
                <p className={styles.policyText}>
                  <span>계속 진행하면</span>
                  <Link className={styles.policyLink} href={PRIVACY_PAGE_HREF}>
                    개인정보처리방침
                  </Link>
                  <span>에 동의한 것으로 간주됩니다.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
