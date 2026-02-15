"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">문제가 발생했습니다.</h2>
          <p className="mb-8 text-gray-600">{error.message}</p>
          <button
            onClick={() => {
              reset();
            }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
