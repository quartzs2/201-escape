"use client";

import type { Route } from "next";

import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

type ErrorPageFallbackProps = {
  description: string;
  error: Error & { digest?: string };
  navHref: Route;
  navLabel: string;
  resetAction: () => void;
  title: string;
};

export function ErrorPageFallback({
  description,
  error,
  navHref,
  navLabel,
  resetAction,
  title,
}: ErrorPageFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {description}
          {error.digest && (
            <span className="mt-1 block text-xs text-muted-foreground/60">
              오류 코드: {error.digest}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={resetAction} variant="outline">
          다시 시도
        </Button>
        <Button asChild>
          <Link href={navHref}>{navLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
