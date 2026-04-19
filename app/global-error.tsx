"use client";

import { ErrorPageFallback } from "./_components/ErrorPageFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="bg-muted/30 text-foreground">
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 text-foreground backdrop-blur-xl lg:px-10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Global error recovery must bypass client routing. */}
              <a
                className="text-base font-bold tracking-[-0.03em] text-foreground"
                href="/"
              >
                201 escape
              </a>
            </div>
          </header>
          <ErrorPageFallback
            description="예상치 못한 오류가 발생했습니다. 다시 시도하거나 홈으로 이동해 주세요."
            error={error}
            navHref="/"
            navLabel="홈으로 이동"
            reportSource="app-global-error"
            resetAction={reset}
            title="문제가 발생했습니다"
            viewport="withoutHeader"
          />
        </div>
      </body>
    </html>
  );
}
