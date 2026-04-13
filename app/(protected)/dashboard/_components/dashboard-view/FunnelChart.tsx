"use client";

import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FunnelStep } from "@/lib/types/application";

import { createFunnelChartModel } from "../../_utils/dashboard-chart";
import { FUNNEL_CHART_HEIGHT } from "./constants";
import {
  clampTooltipX,
  DashboardChartTooltip,
  type DashboardChartTooltipState,
} from "./DashboardChartTooltip";

type Props = {
  data: FunnelStep[];
};

export function FunnelChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<DashboardChartTooltipState | null>(
    null,
  );
  const model = createFunnelChartModel(data);

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

  if (model.bars.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-3xl bg-muted/30 px-6 text-center text-sm text-muted-foreground"
        style={{ height: FUNNEL_CHART_HEIGHT }}
      >
        아직 단계별 지원 데이터가 없어 전환 그래프를 그리지 않았습니다.
      </div>
    );
  }

  const showTooltipAtElement = (
    currentTarget: SVGRectElement,
    bar: (typeof model.bars)[number],
    pinned = false,
  ) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = currentTarget.getBoundingClientRect();
    const x = clampTooltipX(
      targetRect.left - containerRect.left + targetRect.width / 2,
      containerRect.width,
    );
    const y = Math.max(targetRect.top - containerRect.top, 32);

    setTooltip({
      description: "지원 완료 기준 현재 단계에 남아 있는 건수",
      key: bar.label,
      pinned,
      title: bar.label,
      value: `${bar.count}건`,
      x,
      y,
    });
  };

  const togglePinnedTooltip = (
    event: ReactMouseEvent<SVGRectElement>,
    bar: (typeof model.bars)[number],
  ) => {
    if (tooltip?.pinned && tooltip.key === bar.label) {
      setTooltip(null);

      return;
    }

    showTooltipAtElement(event.currentTarget, bar, true);
  };

  return (
    <div
      className="relative"
      onPointerLeave={() => {
        if (!tooltip?.pinned) {
          setTooltip(null);
        }
      }}
      ref={containerRef}
    >
      <DashboardChartTooltip tooltip={tooltip} />
      <svg
        aria-label="지원 기준 단계별 잔존 비율"
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${model.width} ${model.height}`}
      >
        {model.ticks.map((tick) => {
          const ratio =
            model.ticks[model.ticks.length - 1]?.value && tick.value >= 0
              ? tick.value / (model.ticks[model.ticks.length - 1]?.value ?? 1)
              : 0;
          const x = model.plotLeft + (model.plotRight - model.plotLeft) * ratio;

          return (
            <text
              fill="var(--color-muted-foreground)"
              fontSize="20"
              fontWeight="500"
              key={tick.value}
              textAnchor="middle"
              x={x}
              y={model.height - 6}
            >
              {tick.value}
            </text>
          );
        })}

        {model.bars.map((bar) => (
          <g key={bar.label}>
            <text
              dominantBaseline="middle"
              fill="var(--color-foreground)"
              fontSize="20"
              fontWeight="500"
              x="0"
              y={bar.y + bar.height / 2}
            >
              {bar.label}
            </text>
            <rect
              aria-label={`${bar.label} ${bar.count}건`}
              fill="var(--color-primary)"
              fillOpacity="0.92"
              height={bar.height}
              onBlur={() => {
                if (!tooltip?.pinned) {
                  setTooltip(null);
                }
              }}
              onClick={(event) => {
                togglePinnedTooltip(event, bar);
              }}
              onFocus={(event) => {
                showTooltipAtElement(
                  event.currentTarget,
                  bar,
                  tooltip?.pinned ?? false,
                );
              }}
              onPointerEnter={(event) => {
                if (!tooltip?.pinned) {
                  showTooltipAtElement(event.currentTarget, bar);
                }
              }}
              rx="8"
              tabIndex={0}
              width={bar.width}
              x={bar.x}
              y={bar.y}
            >
              <title>{`${bar.label} ${bar.count}건`}</title>
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
}
