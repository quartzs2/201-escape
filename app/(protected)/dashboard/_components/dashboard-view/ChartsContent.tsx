import { getChartData } from "@/lib/actions";

import { DashboardCharts } from "./DashboardCharts";

export async function ChartsContent() {
  const result = await getChartData();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  const { funnel, monthly } = result.data;

  return <DashboardCharts funnel={funnel} monthly={monthly} />;
}
