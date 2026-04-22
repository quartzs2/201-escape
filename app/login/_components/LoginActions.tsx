"use client";

import { useSyncExternalStore } from "react";

import { isLikelyWebViewUserAgent } from "@/lib/auth/webview";

import { GoogleLoginButton } from "./GoogleLoginButton";
import { WebViewLoginNotice } from "./WebViewLoginNotice";

const PRIVACY_PAGE_HREF = "/privacy";

type LoginActionsProps = {
  shouldShowWebViewNotice: boolean;
};

export function LoginActions({ shouldShowWebViewNotice }: LoginActionsProps) {
  const isClientWebView = useClientWebViewDetectionSnapshot();
  const isWebView = shouldShowWebViewNotice || isClientWebView;

  if (isWebView) {
    return <WebViewLoginNotice />;
  }

  return (
    <>
      <GoogleLoginButton />
      <div className="flex justify-center px-1">
        <p className="text-center text-sm leading-5 font-medium text-muted-foreground">
          <span>계속 진행하면 </span>
          <a
            className="font-semibold text-primary underline underline-offset-4"
            href={PRIVACY_PAGE_HREF}
          >
            개인정보처리방침
          </a>
          <span>에</span>
          <br />
          <span>동의한 것으로 간주됩니다.</span>
        </p>
      </div>
    </>
  );
}

function getClientWebViewDetectionSnapshot(): boolean {
  return isLikelyWebViewUserAgent(window.navigator.userAgent);
}

function getFalseSnapshot(): boolean {
  return false;
}

function subscribeToStaticBrowserSnapshot(): () => void {
  return () => {};
}

function useClientWebViewDetectionSnapshot(): boolean {
  return useSyncExternalStore(
    subscribeToStaticBrowserSnapshot,
    getClientWebViewDetectionSnapshot,
    getFalseSnapshot,
  );
}
