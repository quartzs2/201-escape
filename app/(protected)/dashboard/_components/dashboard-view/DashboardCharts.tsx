import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import { DashboardFunnelBreakdown } from "./DashboardFunnelBreakdown";
import { DashboardInsightPanel } from "./DashboardInsightPanel";
import {
  DeferredFunnelChart,
  DeferredMonthlyTrendChart,
} from "./DeferredDashboardCharts";

type Props = {
  funnel: FunnelStep[];
  monthly: MonthlyCount[];
};

export function DashboardCharts({ funnel, monthly }: Props) {
  return (
    <div className="space-y-16 lg:space-y-20">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:gap-12">
        <div className="min-w-0">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Monthly Trend
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                최근 12개월 지원 추이
              </h2>
              <p className="text-sm leading-6 font-medium text-muted-foreground">
                월별 지원량의 증감 흐름을 먼저 확인하고, 아래 단계별 전환과 함께
                읽어 보세요.
              </p>
            </div>
          </div>
          <DeferredMonthlyTrendChart data={monthly} />
        </div>

        <DashboardInsightPanel funnel={funnel} monthly={monthly} />
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="min-w-0">
          <div className="mb-8 space-y-1">
            <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Funnel
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              지원 기준 단계별 잔존 비율
            </h2>
            <p className="text-sm leading-6 font-medium text-muted-foreground">
              전체 지원 수를 기준으로 각 단계에 몇 건이 남아 있는지 확인합니다.
            </p>
          </div>
          <DeferredFunnelChart data={funnel} />
        </div>

        <DashboardFunnelBreakdown data={funnel} />
      </section>
    </div>
  );
}
