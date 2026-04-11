import { getStatCounts } from "@/lib/actions";

import { DashboardOverview } from "./DashboardOverview";

export async function StatCardsContent() {
  const result = await getStatCounts();

  if (!result.ok) {
    throw new Error(result.reason);
  }

  return <DashboardOverview stats={result.data} />;
}
