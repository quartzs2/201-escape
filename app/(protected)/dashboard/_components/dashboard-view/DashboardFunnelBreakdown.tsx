import type { FunnelStep } from "@/lib/types/application";

import { getFunnelBreakdown } from "../../_utils/dashboard";

type DashboardFunnelBreakdownProps = {
  data: FunnelStep[];
};

export function DashboardFunnelBreakdown({
  data,
}: DashboardFunnelBreakdownProps) {
  const items = getFunnelBreakdown(data);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Retention By Stage
        </p>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
          전체 지원 수 대비 각 단계에 남아 있는 비율입니다
        </h3>
      </div>

      <ul aria-label="지원 기준 단계별 잔존 비율" className="space-y-4">
        {items.map((item) => (
          <li className="space-y-2" key={item.label}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  전체 지원 대비 {item.shareOfStart}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black tracking-tight text-foreground">
                  {item.count}
                </p>
                <p className="text-xs text-muted-foreground">건</p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${item.width}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
