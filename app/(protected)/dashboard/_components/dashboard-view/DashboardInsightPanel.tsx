import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import { formatPercent, getMonthlyTrendSummary } from "../../_utils/dashboard";

type DashboardInsightPanelProps = {
  funnel: FunnelStep[];
  monthly: MonthlyCount[];
};

export function DashboardInsightPanel({
  funnel,
  monthly,
}: DashboardInsightPanelProps) {
  const monthlySummary = getMonthlyTrendSummary(monthly);
  const appliedCount = funnel[0]?.count ?? 0;
  const offeredCount =
    funnel.length > 0 ? (funnel[funnel.length - 1]?.count ?? 0) : 0;
  const interviewCount =
    funnel.find((step) => step.label === "면접")?.count ?? 0;
  return (
    <aside className="flex h-full flex-col justify-between rounded-3xl border border-border/70 bg-muted/55 px-5 py-6">
      <div>
        <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Quick Notes
        </p>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
          최근 흐름과 전환 상태
        </h3>
        <p className="mt-2 text-sm leading-6 font-medium text-muted-foreground">
          숫자를 해석할 때 먼저 확인할 포인트만 정리했습니다.
        </p>
      </div>

      <dl className="mt-8 space-y-6">
        <div className="space-y-1">
          <dt className="text-sm font-semibold text-foreground">
            최근 월 지원
          </dt>
          <dd className="text-2xl font-bold tracking-tight text-foreground">
            {monthlySummary.latestCount}건
          </dd>
          <dd className="text-sm leading-6 font-medium text-muted-foreground">
            {monthlySummary.latestMonthLabel} 기준,{" "}
            {monthlySummary.comparisonLabel}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm font-semibold text-foreground">최종 전환율</dt>
          <dd className="text-2xl font-bold tracking-tight text-foreground">
            {formatPercent(offeredCount, appliedCount)}
          </dd>
          <dd className="text-sm leading-6 font-medium text-muted-foreground">
            지원 {appliedCount}건 중 {offeredCount}건이 최종 합격으로
            이어졌습니다.
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm font-semibold text-foreground">면접 집중도</dt>
          <dd className="text-2xl font-bold tracking-tight text-foreground">
            {formatPercent(interviewCount, appliedCount)}
          </dd>
          <dd className="text-sm leading-6 font-medium text-muted-foreground">
            지원 기준으로 현재 면접 단계까지 도달한 비율입니다.
          </dd>
        </div>
      </dl>
    </aside>
  );
}
