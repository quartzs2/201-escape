import { getChartData } from "@/lib/actions";

import { DeferredDashboardCharts } from "./DeferredDashboardCharts";

export async function ChartsContent() {
  const result = await getChartData();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  const { funnel, monthly } = result.data;

  return <DeferredDashboardCharts funnel={funnel} monthly={monthly} />;
}
