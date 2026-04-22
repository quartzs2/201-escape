"use client";

import { useSyncExternalStore } from "react";

import { isLikelyWebViewUserAgent } from "@/lib/auth/webview";

import { GoogleLoginButton } from "./GoogleLoginButton";
import { WebViewLoginNotice } from "./WebViewLoginNotice";

type LoginActionsProps = {
  shouldShowWebViewNotice: boolean;
};

export function LoginActions({ shouldShowWebViewNotice }: LoginActionsProps) {
  const isClientWebView = useClientWebViewDetectionSnapshot();
  const isWebView = shouldShowWebViewNotice || isClientWebView;

  if (isWebView) {
    return <WebViewLoginNotice />;
  }

  return <GoogleLoginButton />;
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
