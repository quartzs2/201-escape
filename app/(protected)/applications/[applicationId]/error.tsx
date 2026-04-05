"use client";

import { ErrorPageFallback } from "@/app/_components/ErrorPageFallback";

export default function ApplicationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-muted/30">
      <ErrorPageFallback
        description="일시적인 오류가 발생했습니다. 다시 시도하거나 대시보드로 돌아가 주세요."
        error={error}
        navHref="/dashboard"
        navLabel="지원 현황으로 돌아가기"
        resetAction={reset}
        title="상세 페이지를 불러오지 못했습니다"
      />
    </main>
  );
}
