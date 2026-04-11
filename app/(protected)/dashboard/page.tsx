import { Suspense } from "react";

import { formatKoreanDate } from "@/lib/utils";

import { ChartsContent } from "./_components/dashboard-view/ChartsContent";
import {
  ChartsSkeleton,
  StatCardsSkeleton,
} from "./_components/dashboard-view/DashboardSkeleton";
import { StatCardsContent } from "./_components/dashboard-view/StatCardsContent";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <section className="bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <header className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:items-end">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {formatKoreanDate(new Date())}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                지원 대시보드
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                전체 파이프라인 규모, 최근 12개월 지원 추이, 단계별 전환 흐름을
                한 화면에서 확인합니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  description:
                    "전체 규모와 현재 두꺼운 구간을 먼저 확인합니다.",
                  label: "핵심 수치",
                },
                {
                  description: "월별 증감 흐름으로 최근 지원 리듬을 읽습니다.",
                  label: "월별 추이",
                },
                {
                  description: "지원에서 합격까지 단계별 유지율을 확인합니다.",
                  label: "전환 흐름",
                },
              ].map((item) => (
                <div
                  className="rounded-2xl bg-background/70 px-4 py-4"
                  key={item.label}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </header>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-12">
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCardsContent />
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <ChartsContent />
        </Suspense>
      </div>
    </main>
  );
}
