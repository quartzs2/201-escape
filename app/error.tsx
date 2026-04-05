"use client";

import { ErrorPageFallback } from "./_components/ErrorPageFallback";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPageFallback
      description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      error={error}
      navHref="/dashboard"
      navLabel="대시보드로 이동"
      resetAction={reset}
      title="페이지를 불러오지 못했습니다"
    />
  );
}
