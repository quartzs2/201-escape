"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useRef } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) {
      return;
    }
    captured.current = true;
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">문제가 발생했습니다.</h2>
          <p className="mb-8 text-gray-600">
            예상치 못한 오류가 발생했습니다.
            {error.digest && (
              <span className="mt-1 block text-xs text-gray-400">
                오류 코드: {error.digest}
              </span>
            )}
          </p>
          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            onClick={reset}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
