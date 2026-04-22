"use client";

import {
  Check as CheckIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  Info as InfoIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button/Button";
import { isAndroidUserAgent } from "@/lib/auth/webview";
import { cn } from "@/lib/utils/cn";

const COPY_STATUS_RESET_MS = 2_000;

type CopyStatus = "copied" | "failed" | "idle";

const COPY_STATUS_LABELS: Record<CopyStatus, string> = {
  copied: "주소가 복사되었습니다",
  failed: "주소 복사에 실패했습니다",
  idle: "주소 복사",
};

export function WebViewLoginNotice() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const isAndroid = useAndroidSnapshot();
  const loginUrl = useLoginUrlSnapshot();

  useEffect(() => {
    if (copyStatus === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyStatus("idle");
    }, COPY_STATUS_RESET_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyStatus]);

  const chromeIntentUrl = useMemo(() => {
    if (!loginUrl) {
      return "";
    }

    return createChromeIntentUrl(loginUrl);
  }, [loginUrl]);

  async function handleCopyLoginUrl() {
    if (!loginUrl) {
      return;
    }

    const didCopy = await copyTextToClipboard(loginUrl);

    setCopyStatus(didCopy ? "copied" : "failed");
  }

  const isCopied = copyStatus === "copied";

  return (
    <section aria-labelledby="webview-login-title" className="text-left">
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <InfoIcon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <h2
            className="text-base leading-6 font-bold text-foreground"
            id="webview-login-title"
          >
            외부 브라우저에서 로그인이 필요합니다.
          </h2>
          <p className="mt-2 text-sm leading-6 font-medium text-muted-foreground">
            현재 앱 내 브라우저에서는 Google 로그인이 제한될 수 있습니다.
            <br />
            Safari 또는 Chrome에서 다시 열어 주세요.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {isAndroid && chromeIntentUrl ? (
              <Button asChild className="h-11 w-full" variant="default">
                <a href={chromeIntentUrl}>
                  <ExternalLinkIcon aria-hidden="true" className="h-4 w-4" />
                  Chrome으로 열기
                </a>
              </Button>
            ) : null}

            <Button
              className={cn(
                "h-11 w-full",
                isCopied && "border-primary/40 text-primary",
              )}
              disabled={!loginUrl}
              onClick={handleCopyLoginUrl}
              variant="outline"
            >
              {isCopied ? (
                <CheckIcon aria-hidden="true" className="h-4 w-4" />
              ) : (
                <CopyIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {COPY_STATUS_LABELS[copyStatus]}
            </Button>
          </div>

          <p
            aria-live="polite"
            className="mt-3 text-xs leading-5 font-medium text-muted-foreground"
          >
            {isAndroid
              ? "Chrome으로 열기가 동작하지 않으면 주소를 복사해 외부 브라우저에 붙여넣어 주세요."
              : "iPhone에서는 공유 버튼을 누른 뒤 Safari에서 열기를 선택해 주세요."}
          </p>
        </div>
      </div>
    </section>
  );
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await window.navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}

function createChromeIntentUrl(pageUrl: string): string {
  const url = new URL(pageUrl);
  const path = `${url.host}${url.pathname}${url.search}${url.hash}`;
  const scheme = url.protocol.replace(":", "");

  return `intent://${path}#Intent;scheme=${scheme};package=com.android.chrome;end`;
}

function getClientAndroidSnapshot(): boolean {
  return isAndroidUserAgent(window.navigator.userAgent);
}

function getClientLoginUrlSnapshot(): string {
  return `${window.location.origin}/login`;
}

function getEmptyStringSnapshot(): string {
  return "";
}

function getFalseSnapshot(): boolean {
  return false;
}

function subscribeToStaticBrowserSnapshot(): () => void {
  return () => {};
}

function useAndroidSnapshot(): boolean {
  return useSyncExternalStore(
    subscribeToStaticBrowserSnapshot,
    getClientAndroidSnapshot,
    getFalseSnapshot,
  );
}

function useLoginUrlSnapshot(): string {
  return useSyncExternalStore(
    subscribeToStaticBrowserSnapshot,
    getClientLoginUrlSnapshot,
    getEmptyStringSnapshot,
  );
}
