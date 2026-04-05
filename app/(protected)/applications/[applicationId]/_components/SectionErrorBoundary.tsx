"use client";

import type { ReactNode } from "react";

import { ErrorBoundary } from "@suspensive/react";

import { Button } from "@/components/ui/button/Button";

type SectionErrorBoundaryProps = {
  children: ReactNode;
};

type SectionErrorFallbackProps = {
  reset: () => void;
};

export function SectionErrorBoundary({ children }: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ reset }) => <SectionErrorFallback reset={reset} />}
    >
      {children}
    </ErrorBoundary>
  );
}

function SectionErrorFallback({ reset }: SectionErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        이 섹션을 불러오지 못했습니다.
      </p>
      <Button onClick={reset} size="sm" variant="link">
        다시 시도
      </Button>
    </div>
  );
}
