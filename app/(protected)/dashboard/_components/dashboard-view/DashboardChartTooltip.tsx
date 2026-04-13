import { Tooltip } from "@/components/ui";

export type DashboardChartTooltipState = {
  description?: string;
  key: string;
  pinned?: boolean;
  title: string;
  value: string;
  x: number;
  y: number;
};

type DashboardChartTooltipProps = {
  tooltip: DashboardChartTooltipState | null;
};

const TOOLTIP_EDGE_PADDING = 96;

export function clampTooltipX(x: number, containerWidth: number): number {
  const maxX = Math.max(
    TOOLTIP_EDGE_PADDING,
    containerWidth - TOOLTIP_EDGE_PADDING,
  );

  return Math.min(Math.max(x, TOOLTIP_EDGE_PADDING), maxX);
}

export function DashboardChartTooltip({ tooltip }: DashboardChartTooltipProps) {
  if (!tooltip) {
    return null;
  }

  return (
    <Tooltip
      description={tooltip.description}
      title={tooltip.title}
      value={tooltip.value}
      x={tooltip.x}
      y={tooltip.y}
    />
  );
}
