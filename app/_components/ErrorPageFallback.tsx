"use client";

import type { Route } from "next";

import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils/cn";

type ErrorPageFallbackProps = {
  description: string;
  error: Error & { digest?: string };
  navHref: Route;
  navLabel: string;
  resetAction: () => void;
  title: string;
  viewport?: "full" | "withoutHeader";
};

export function ErrorPageFallback({
  description,
  error,
  navHref,
  navLabel,
  resetAction,
  title,
  viewport = "full",
}: ErrorPageFallbackProps) {
  const isDeploymentMismatchError = error.message.includes(
    'Failed to find Server Action "',
  );

  const handleRetry = () => {
    if (isDeploymentMismatchError) {
      window.location.reload();

      return;
    }

    resetAction();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 p-4 text-center",
        viewport === "withoutHeader"
          ? "min-h-[calc(100svh-4rem)]"
          : "min-h-screen",
      )}
    >
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {description}
          {error.digest && (
            <span className="mt-1 block text-sm text-muted-foreground/60">
              오류 코드: {error.digest}
            </span>
          )}
          {isDeploymentMismatchError && (
            <span className="mt-2 block text-sm text-muted-foreground/80">
              배포가 갱신되면서 이전 페이지 상태가 남아 있을 수 있습니다. 다시
              시도는 전체 새로고침으로 처리됩니다.
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleRetry} variant="outline">
          다시 시도
        </Button>
        <Button asChild>
          <a href={navHref}>{navLabel}</a>
        </Button>
      </div>
    </div>
  );
}
