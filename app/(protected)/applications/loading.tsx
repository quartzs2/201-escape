import { Skeleton } from "@/components/ui/skeleton/Skeleton";

import { ApplicationsPanelFallback } from "./_components/components/ApplicationsPanelFallback";

const PERIOD_CHIP_SKELETON_CLASSES = [
  "h-10 w-14 rounded-full",
  "h-10 w-24 rounded-full",
  "h-10 w-20 rounded-full",
] as const;

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
          <div className="flex flex-wrap gap-2">
            {PERIOD_CHIP_SKELETON_CLASSES.map((className) => (
              <Skeleton className={className} key={className} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
