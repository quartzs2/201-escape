"use client";

import { usePathname } from "next/navigation";

import { ErrorPageFallback } from "./_components/ErrorPageFallback";
import { ErrorPageShell } from "./_components/ErrorPageShell";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isProtectedPath =
    pathname === "/dashboard" ||
    pathname === "/applications" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/applications/");

  return (
    <ErrorPageShell pathname={pathname}>
      <ErrorPageFallback
        description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        error={error}
        navHref={isProtectedPath ? "/dashboard" : "/"}
        navLabel={isProtectedPath ? "대시보드로 이동" : "홈으로 이동"}
        reportSource="app-root-error"
        resetAction={reset}
        title="페이지를 불러오지 못했습니다"
        viewport="withoutHeader"
      />
    </ErrorPageShell>
  );
}
