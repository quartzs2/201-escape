import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

const MIN_FUNNEL_BAR_WIDTH_PERCENT = 6;
const PREVIOUS_MONTH_OFFSET = -2;

type FunnelBreakdownItem = FunnelStep & {
  shareOfStart: string;
  width: number;
};

type MonthlyTrendSummary = {
  comparisonLabel: string;
  direction: "down" | "steady" | "up";
  latestCount: number;
  latestMonthLabel: string;
};

export function formatMonthLabel(month: string): string {
  const [, mm] = month.split("-");

  return `${parseInt(mm ?? "0", 10)}월`;
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export function getFunnelBreakdown(data: FunnelStep[]): FunnelBreakdownItem[] {
  const startCount = data[0]?.count ?? 0;

  return data.map((step) => ({
    ...step,
    shareOfStart: formatPercent(step.count, startCount),
    width:
      startCount > 0
        ? Math.max(
            (step.count / startCount) * 100,
            MIN_FUNNEL_BAR_WIDTH_PERCENT,
          )
        : MIN_FUNNEL_BAR_WIDTH_PERCENT,
  }));
}

export function getMonthlyTrendSummary(
  monthly: MonthlyCount[],
): MonthlyTrendSummary {
  const latest = monthly.length > 0 ? monthly[monthly.length - 1] : undefined;

  if (!latest) {
    return {
      comparisonLabel: "비교할 최근 월 데이터가 아직 없습니다.",
      direction: "steady",
      latestCount: 0,
      latestMonthLabel: "기록 없음",
    };
  }

  const previousIndex = monthly.length + PREVIOUS_MONTH_OFFSET;
  const previous = previousIndex >= 0 ? monthly[previousIndex] : undefined;

  if (!previous) {
    return {
      comparisonLabel: "이전 월 데이터가 없어 추이를 계산하지 않았습니다.",
      direction: "steady",
      latestCount: latest.count,
      latestMonthLabel: formatMonthLabel(latest.month),
    };
  }

  const delta = latest.count - previous.count;

  if (delta === 0) {
    return {
      comparisonLabel: "전월과 동일한 지원 수를 유지했습니다.",
      direction: "steady",
      latestCount: latest.count,
      latestMonthLabel: formatMonthLabel(latest.month),
    };
  }

  return {
    comparisonLabel:
      delta > 0
        ? `전월보다 ${Math.abs(delta)}건 더 지원했습니다.`
        : `전월보다 ${Math.abs(delta)}건 적게 지원했습니다.`,
    direction: delta > 0 ? "up" : "down",
    latestCount: latest.count,
    latestMonthLabel: formatMonthLabel(latest.month),
  };
}
