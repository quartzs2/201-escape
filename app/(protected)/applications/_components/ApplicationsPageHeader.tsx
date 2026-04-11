import type { ApplicationListItem } from "@/lib/types/application";

import { buildApplicationsOverviewContent } from "./_utils/summary";
import { type PeriodPreset, type SortValue, type TabValue } from "./constants";

type ApplicationsPageHeaderProps = {
  applications: ApplicationListItem[];
  dateLabel: string;
  hasNextPage: boolean;
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

export function ApplicationsPageHeader({
  applications,
  dateLabel,
  hasNextPage,
  period,
  search,
  sort,
  tab,
}: ApplicationsPageHeaderProps) {
  const content = buildApplicationsOverviewContent({
    applications,
    hasNextPage,
    period,
    search,
    sort,
    tab,
  });
  const [visibleMetric, activeMetric, doneMetric, latestMetric] =
    content.metrics;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] lg:items-end">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {dateLabel}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              지원 목록
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {latestMetric?.label}: {latestMetric?.value}
              {hasNextPage && " · 아래로 스크롤하면 다음 항목이 이어집니다."}
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {[visibleMetric, activeMetric, doneMetric].map((metric) => (
              <div
                className="rounded-2xl bg-background/70 px-4 py-3.5"
                key={metric?.label}
              >
                <dt className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  {metric?.label}
                </dt>
                <dd className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {metric?.value}
                </dd>
              </div>
            ))}
          </dl>
        </header>
      </div>
    </section>
  );
}
