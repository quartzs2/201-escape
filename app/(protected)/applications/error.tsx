"use client";

import { ErrorPageFallback } from "@/app/_components/ErrorPageFallback";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-muted/30">
      <ErrorPageFallback
        description="목록 로딩 중 오류가 발생했습니다. 다시 시도하거나 잠시 후 돌아와 주세요."
        error={error}
        navHref="/"
        navLabel="홈으로 이동"
        resetAction={reset}
        title="지원 목록을 불러오지 못했습니다"
      />
    </main>
  );
}
