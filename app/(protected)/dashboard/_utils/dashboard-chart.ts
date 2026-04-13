import type { FunnelStep, MonthlyCount } from "@/lib/types/application";

import {
  FUNNEL_CHART_HEIGHT,
  MONTHLY_CHART_HEIGHT,
} from "../_components/dashboard-view/constants";

const CHART_WIDTH = 640;

const MONTHLY_CHART_PADDING = {
  bottom: 28,
  left: 32,
  right: 18,
  top: 12,
} as const;

const FUNNEL_CHART_PADDING = {
  bottom: 36,
  left: 92,
  right: 18,
  top: 4,
} as const;

const MIN_FUNNEL_BAR_WIDTH = 10;
const MONTHLY_TICK_COUNT = 4;
const FUNNEL_TICK_COUNT = 2;

export type FunnelBarModel = {
  count: number;
  height: number;
  label: string;
  width: number;
  x: number;
  y: number;
};

export type FunnelChartModel = {
  bars: FunnelBarModel[];
  height: number;
  plotBottom: number;
  plotLeft: number;
  plotRight: number;
  ticks: LinearTick[];
  width: number;
};

export type MonthlyChartPointModel = {
  count: number;
  label: string;
  month: string;
  x: number;
  y: number;
};

export type MonthlyTrendChartModel = {
  areaPath: string;
  height: number;
  linePath: string;
  plotBottom: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  points: MonthlyChartPointModel[];
  ticks: Array<LinearTick & { y: number }>;
  width: number;
};

type LinearTick = {
  value: number;
};

export function createFunnelChartModel(data: FunnelStep[]): FunnelChartModel {
  const height = FUNNEL_CHART_HEIGHT;
  const width = CHART_WIDTH;
  const plotLeft = FUNNEL_CHART_PADDING.left;
  const plotRight = width - FUNNEL_CHART_PADDING.right;
  const plotBottom = height - FUNNEL_CHART_PADDING.bottom;
  const plotTop = FUNNEL_CHART_PADDING.top;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const rowHeight = data.length > 0 ? plotHeight / data.length : plotHeight;
  const barHeight = Math.min(40, rowHeight * 0.62);
  const maxCount = Math.max(...data.map((item) => item.count), 0);
  const ticks = buildLinearTicks(maxCount, FUNNEL_TICK_COUNT);
  const maxTickValue = ticks[ticks.length - 1]?.value ?? 1;

  const bars = data.map((step, index) => {
    const centerY = plotTop + rowHeight * index + rowHeight / 2;
    const rawWidth =
      maxTickValue > 0 ? (plotWidth * step.count) / maxTickValue : 0;
    const width = step.count > 0 ? Math.max(rawWidth, MIN_FUNNEL_BAR_WIDTH) : 0;

    return {
      count: step.count,
      height: barHeight,
      label: step.label,
      width,
      x: plotLeft,
      y: centerY - barHeight / 2,
    };
  });

  return {
    bars,
    height,
    plotBottom,
    plotLeft,
    plotRight,
    ticks,
    width,
  };
}

export function createMonthlyTrendChartModel(
  data: MonthlyCount[],
): MonthlyTrendChartModel {
  const height = MONTHLY_CHART_HEIGHT;
  const width = CHART_WIDTH;
  const plotLeft = MONTHLY_CHART_PADDING.left;
  const plotRight = width - MONTHLY_CHART_PADDING.right;
  const plotTop = MONTHLY_CHART_PADDING.top;
  const plotBottom = height - MONTHLY_CHART_PADDING.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const ticks = buildLinearTicks(
    Math.max(...data.map((item) => item.count), 0),
    MONTHLY_TICK_COUNT,
  );
  const maxTickValue = ticks[ticks.length - 1]?.value ?? 1;

  const points = data.map((month, index) => {
    const ratio = maxTickValue > 0 ? month.count / maxTickValue : 0;
    const x =
      data.length === 1
        ? plotLeft + plotWidth / 2
        : plotLeft + (plotWidth / (data.length - 1)) * index;
    const y = plotBottom - plotHeight * ratio;

    return {
      count: month.count,
      label: month.month.slice(5).replace(/^0/, "") + "월",
      month: month.month,
      x,
      y,
    };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x.toFixed(2)} ${plotBottom.toFixed(
          2,
        )} L ${firstPoint.x.toFixed(2)} ${plotBottom.toFixed(2)} Z`
      : "";

  return {
    areaPath,
    height,
    linePath,
    plotBottom,
    plotLeft,
    plotRight,
    plotTop,
    points,
    ticks: ticks.map((tick) => ({
      ...tick,
      y: plotBottom - (plotHeight * tick.value) / maxTickValue,
    })),
    width,
  };
}

function buildLinearTicks(
  maxValue: number,
  targetTickCount: number,
): LinearTick[] {
  const safeMaxValue = Math.max(maxValue, 1);
  const roughStep = safeMaxValue / targetTickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;

  let step = magnitude;

  if (normalizedStep > 5) {
    step = magnitude * 10;
  } else if (normalizedStep > 2) {
    step = magnitude * 5;
  } else if (normalizedStep > 1) {
    step = magnitude * 2;
  }

  const upperBound = Math.max(step, Math.ceil(safeMaxValue / step) * step);
  const ticks: LinearTick[] = [];

  for (let value = 0; value <= upperBound; value += step) {
    ticks.push({ value });
  }

  if (ticks[ticks.length - 1]?.value !== upperBound) {
    ticks.push({ value: upperBound });
  }

  return ticks;
}
