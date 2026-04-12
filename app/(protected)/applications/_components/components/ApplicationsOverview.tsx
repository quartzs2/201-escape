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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:gap-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              {content.eyebrow}
            </p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                {visibleMetric?.value}
              </span>
              <p className="pb-1 text-sm font-medium text-muted-foreground">
                {visibleMetric?.label}
              </p>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {content.headline}. {content.description}
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {secondaryMetrics.map((metric) => (
              <div
                className="rounded-3xl bg-muted/45 px-5 py-5 transition-colors hover:bg-muted/60"
                key={metric.label}
              >
                <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  {metric.label}
                </dt>
                <dd className="mt-3 text-3xl font-black tracking-tight text-foreground">
                  {metric.value}
                </dd>
                <dd className="mt-2 text-xs leading-5 text-muted-foreground">
                  {metric.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-muted/55 px-5 py-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Quick Notes
          </p>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
            현재 목록 해석 포인트
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            지금 보고 있는 조건과 스크롤 상태를 먼저 확인할 수 있게
            정리했습니다.
          </p>

          <ul aria-label="현재 보기 조건" className="mt-6 flex flex-wrap gap-2">
            {content.chips.map((chip) => (
              <li
                className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground"
                key={chip}
              >
                {chip}
              </li>
            ))}
          </ul>

          <dl className="mt-8 space-y-6">
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-foreground">
                현재 기준
              </dt>
              <dd className="text-2xl font-black tracking-tight text-foreground">
                {visibleMetric?.value}
              </dd>
              <dd className="text-sm leading-6 text-muted-foreground">
                {visibleMetric?.description}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-foreground">
                보기 맥락
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">
                {content.description}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
