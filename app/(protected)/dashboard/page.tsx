import { Suspense } from "react";

import { getDashboardData } from "@/lib/actions";

import { DashboardCharts } from "./_components/dashboard-view/DashboardCharts";
import { DashboardHeader } from "./_components/dashboard-view/DashboardHeader";
import { DashboardOverview } from "./_components/dashboard-view/DashboardOverview";
import {
  ChartsSkeleton,
  StatCardsSkeleton,
} from "./_components/dashboard-view/DashboardSkeleton";

type DashboardDataPromise = ReturnType<typeof getDashboardData>;

type DashboardSectionProps = {
  dataPromise: DashboardDataPromise;
};

export default function DashboardPage() {
  const dashboardDataPromise = getDashboardData();

  return (
    <main className="min-h-screen bg-background pb-20">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-12">
        <Suspense fallback={<StatCardsSkeleton />}>
          <DashboardOverviewSection dataPromise={dashboardDataPromise} />
        </Suspense>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardChartsSection dataPromise={dashboardDataPromise} />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardChartsSection({ dataPromise }: DashboardSectionProps) {
  const result = await dataPromise;

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

async function DashboardOverviewSection({
  dataPromise,
}: DashboardSectionProps) {
  const result = await dataPromise;

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return <DashboardOverview stats={result.data.stats} />;
}
