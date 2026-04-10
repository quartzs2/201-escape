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
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-1.5 px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {formatKoreanDate(new Date())}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            지원 현황
          </h1>
        </header>

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
