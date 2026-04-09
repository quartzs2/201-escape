import { getApplicationsStats } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

import { FunnelChart } from "./FunnelChart";
import { MonthlyTrendChart } from "./MonthlyTrendChart";

export async function DashboardView() {
  const statsResult = await getApplicationsStats();

  if (!statsResult.ok) {
    throw new Error(statsResult.reason);
  }

  const { docs, funnel, interviewing, monthly, offered, total } =
    statsResult.data;

  const cards = [
    { label: "전체", value: total },
    { label: "서류", value: docs },
    { label: "면접", value: interviewing },
    { label: "합격", value: offered },
  ];

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-1.5 px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {formatKoreanDate(new Date())}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            지원 현황
          </h1>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <div
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
              key={card.label}
            >
              <span className="text-2xl font-black tracking-tight text-foreground">
                {card.value}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {card.label}
              </span>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            월별 지원 추이
          </h2>
          <MonthlyTrendChart data={monthly} />
        </section>

        <section className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            단계별 현황
          </h2>
          <FunnelChart data={funnel} />
        </section>
      </div>
    </main>
  );
}
