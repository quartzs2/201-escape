import { Suspense } from "react";

import { getChartData, getStatCounts } from "@/lib/actions";

import { DashboardCharts } from "./_components/dashboard-view/DashboardCharts";
import { DashboardHeader } from "./_components/dashboard-view/DashboardHeader";
import { DashboardOverview } from "./_components/dashboard-view/DashboardOverview";
import {
  ChartsSkeleton,
  StatCardsSkeleton,
} from "./_components/dashboard-view/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-12">
        <Suspense fallback={<StatCardsSkeleton />}>
          <DashboardOverviewSection />
        </Suspense>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardChartsSection />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardChartsSection() {
  const result = await getChartData();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return (
    <DashboardCharts
      funnel={result.data.funnel}
      monthly={result.data.monthly}
    />
  );
}

async function DashboardOverviewSection() {
  const result = await getStatCounts();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return <DashboardOverview stats={result.data} />;
}
