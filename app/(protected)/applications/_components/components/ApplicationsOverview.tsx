import type { ApplicationListItem } from "@/lib/types/application";

import type { PeriodPreset, SortValue, TabValue } from "../constants";

import { buildApplicationsOverviewContent } from "../../_utils/summary";

type ApplicationsOverviewProps = {
  applications: ApplicationListItem[];
  hasNextPage: boolean;
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

export function ApplicationsOverview({
  applications,
  hasNextPage,
  period,
  search,
  sort,
  tab,
}: ApplicationsOverviewProps) {
  const content = buildApplicationsOverviewContent({
    applications,
    hasNextPage,
    period,
    search,
    sort,
    tab,
  });
  const [visibleMetric, ...secondaryMetrics] = content.metrics;

  return (
    <section className="animate-fade-up" style={{ animationDelay: "60ms" }}>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {content.eyebrow}
          </p>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              {visibleMetric?.value}
            </span>
            <p className="pb-1 text-sm font-medium text-muted-foreground">
              {visibleMetric?.label}
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-6 font-medium text-muted-foreground sm:text-[15px]">
            {content.headline}. {content.description}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {secondaryMetrics.map((metric) => (
            <div
              className="rounded-3xl bg-muted/45 px-5 py-5 transition-colors hover:bg-muted/60"
              key={metric.label}
            >
              <dt className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {metric.label}
              </dt>
              <dd className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {metric.value}
              </dd>
              <dd className="mt-2 text-sm leading-5 font-medium text-muted-foreground">
                {metric.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
