"use client";

import {
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type { MonthlyCount } from "@/lib/types/application";

import { createMonthlyTrendChartModel } from "../../_utils/dashboard-chart";
import { MONTHLY_CHART_HEIGHT } from "./constants";
import {
  clampTooltipX,
  DashboardChartTooltip,
  type DashboardChartTooltipState,
} from "./DashboardChartTooltip";

type Props = {
  data: MonthlyCount[];
};

export function MonthlyTrendChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<DashboardChartTooltipState | null>(
    null,
  );
  const model = createMonthlyTrendChartModel(data);

  useEffect(() => {
    if (!tooltip?.pinned) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      if (event.target instanceof Node && container.contains(event.target)) {
        return;
      }

      setTooltip(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [tooltip]);

  if (model.points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-3xl bg-muted/30 px-6 text-center text-sm text-muted-foreground"
        style={{ height: MONTHLY_CHART_HEIGHT }}
      >
        아직 월별 지원 데이터가 없어 추이 그래프를 그리지 않았습니다.
      </div>
    );
  }

  const showTooltipAtElement = (
    event: ReactFocusEvent<SVGCircleElement>,
    point: (typeof model.points)[number],
    pinned = false,
  ) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();
    const x = clampTooltipX(
      targetRect.left - containerRect.left + targetRect.width / 2,
      containerRect.width,
    );
    const y = Math.max(targetRect.top - containerRect.top, 32);

    setTooltip({
      description: `${point.month} 기준 지원 기록`,
      key: point.month,
      pinned,
      title: point.label,
      value: `${point.count}건`,
      x,
      y,
    });
  };

  const togglePinnedTooltip = (
    event: ReactMouseEvent<SVGCircleElement>,
    point: (typeof model.points)[number],
  ) => {
    if (tooltip?.pinned && tooltip.key === point.month) {
      setTooltip(null);

      return;
    }

    showTooltipAtElement(
      event as unknown as ReactFocusEvent<SVGCircleElement>,
      point,
      true,
    );
  };

  return (
    <div
      className="relative rounded-3xl bg-background/70 px-2 py-3 sm:px-3"
      onPointerLeave={() => {
        if (!tooltip?.pinned) {
          setTooltip(null);
        }
      }}
      ref={containerRef}
    >
      <DashboardChartTooltip tooltip={tooltip} />
      <svg
        aria-label="최근 12개월 월별 지원 수 추이"
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${model.width} ${model.height}`}
      >
        <defs>
          <linearGradient id="monthlyTrendArea" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.24"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0.04"
            />
          </linearGradient>
        </defs>

        {model.ticks.map((tick) => (
          <g key={tick.value}>
            <line
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1={model.plotLeft}
              x2={model.plotRight}
              y1={tick.y}
              y2={tick.y}
            />
            <text
              className="text-[18px] md:text-[14px]"
              fill="var(--color-muted-foreground)"
              textAnchor="end"
              x={model.plotLeft - 8}
              y={tick.y + 5}
            >
              {tick.value}
            </text>
          </g>
        ))}

        <path d={model.areaPath} fill="url(#monthlyTrendArea)" />
        <path
          d={model.linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {model.points.map((point) => (
          <g key={point.month}>
            <circle cx={point.x} cy={point.y} fill="var(--color-primary)" r="4">
              <title>{`${point.label} 지원 수 ${point.count}건`}</title>
            </circle>
            <text
              className="text-[18px] md:text-[14px]"
              fill="var(--color-muted-foreground)"
              textAnchor="middle"
              x={point.x}
              y={model.plotBottom + 22}
            >
              {point.label}
            </text>
            <circle
              aria-label={`${point.label} 지원 수 ${point.count}건`}
              cx={point.x}
              cy={point.y}
              fill="transparent"
              onBlur={() => {
                if (!tooltip?.pinned) {
                  setTooltip(null);
                }
              }}
              onClick={(event) => {
                togglePinnedTooltip(event, point);
              }}
              onFocus={(event) => {
                showTooltipAtElement(event, point, tooltip?.pinned ?? false);
              }}
              onPointerEnter={(event) => {
                if (!tooltip?.pinned) {
                  showTooltipAtElement(
                    event as unknown as ReactFocusEvent<SVGCircleElement>,
                    point,
                  );
                }
              }}
              r="16"
              tabIndex={0}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
