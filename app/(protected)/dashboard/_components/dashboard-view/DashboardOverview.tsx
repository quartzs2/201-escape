import type { StatCounts } from "@/lib/types/application";

import { formatPercent } from "../../_utils/dashboard";

type DashboardOverviewProps = {
  stats: StatCounts;
};

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const { applied, docs, docsPassed, interviewing, offered, saved, total } =
    stats;
  const metrics = [
    {
      description: "아직 지원 전 단계로 저장된 공고",
      label: "관심 공고",
      meta: `전체 등록의 ${formatPercent(saved, total)}`,
      value: saved,
    },
    {
      description: "현재 서류 검토 및 결과 대기",
      label: "서류 단계",
      meta: `지원 기준 ${formatPercent(docs, applied)}`,
      value: docs,
    },
    {
      description: "면접 진행 또는 일정 조율",
      label: "면접 단계",
      meta: `지원 기준 ${formatPercent(interviewing, applied)}`,
      value: interviewing,
    },
    {
      description: "최종 합격 확정",
      label: "합격 단계",
      meta: `지원 기준 ${formatPercent(offered, applied)}`,
      value: offered,
    },
  ];

  return (
    <section className="animate-fade-up" style={{ animationDelay: "60ms" }}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)] lg:gap-12">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Selected KPIs
            </p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                {applied}
              </span>
              <p className="pb-1 text-sm font-medium text-muted-foreground">
                지원 완료 건수
              </p>
            </div>
            <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
              <p className="break-keep">
                전체 등록 {total}건 중 관심 공고 {saved}건을 제외한 실제 지원
                건수입니다.
              </p>
              <p className="break-keep">
                현재 서류 단계 {docs}건, 면접 단계 {interviewing}건, 합격 단계{" "}
                {offered}
                건입니다.
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
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
                  {metric.meta}
                </dd>
                <dd className="mt-1 text-xs leading-5 text-muted-foreground">
                  {metric.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-muted/55 px-5 py-5">
          <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Key Rates
          </p>
          <dl className="mt-5 space-y-5">
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-foreground">
                서류 통과율
              </dt>
              <dd className="text-2xl font-black tracking-tight text-foreground">
                {formatPercent(docsPassed, applied)}
              </dd>
              <dd className="text-sm leading-6 text-muted-foreground">
                지원 {applied}건 중 {docsPassed}건이 서류 통과 이후 단계까지
                진행됐습니다.
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-foreground">
                최종 합격률
              </dt>
              <dd className="text-2xl font-black tracking-tight text-foreground">
                {formatPercent(offered, applied)}
              </dd>
              <dd className="text-sm leading-6 text-muted-foreground">
                지원 {applied}건 중 {offered}건이 최종 합격으로 이어졌습니다.
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-foreground">
                저장 공고 비중
              </dt>
              <dd className="text-2xl font-black tracking-tight text-foreground">
                {formatPercent(saved, total)}
              </dd>
              <dd className="text-sm leading-6 text-muted-foreground">
                전체 등록 {total}건 중 {saved}건이 아직 저장 상태에 머물러
                있습니다.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
