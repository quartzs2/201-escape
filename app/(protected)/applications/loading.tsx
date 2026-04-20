import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import { ApplicationsPanelFallback } from "./_components/components/ApplicationsPanelFallback";

const PERIOD_CHIP_KEYS = [0, 1, 2, 3] as const;

export default function ApplicationsLoading() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-6 pb-10 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-12">
        <section className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-background">
          <ApplicationFiltersFallback />
          <ApplicationsPanelFallback />
        </section>
      </div>
    </main>
  );
}

function ApplicationFiltersFallback() {
  return (
    <section
      aria-hidden="true"
      className="bg-background/95 px-5 py-5 backdrop-blur-sm sm:px-6"
    >
      <div className="grid gap-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="flex flex-wrap items-center gap-2">
          {PERIOD_CHIP_KEYS.map((key) => (
            <Skeleton className="h-8 w-16 rounded-full" key={key} />
          ))}
          <Skeleton className="ml-auto h-8 w-28 rounded-full" />
        </div>
      </div>
    </section>
  );
}
