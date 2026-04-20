import { DashboardHeader } from "./_components/dashboard-view/DashboardHeader";
import {
  ChartsSkeleton,
  StatCardsSkeleton,
} from "./_components/dashboard-view/DashboardSkeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-12">
        <StatCardsSkeleton />
        <ChartsSkeleton />
      </div>
    </main>
  );
}
