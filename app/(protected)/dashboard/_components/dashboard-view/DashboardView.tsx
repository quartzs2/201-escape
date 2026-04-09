import { getApplicationsStats } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

export async function DashboardView() {
  const statsResult = await getApplicationsStats();

  if (!statsResult.ok) {
    throw new Error(statsResult.reason);
  }

  const { docs, interviewing, offered, total } = statsResult.data;

  const stats = [
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

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
              key={stat.label}
            >
              <span className="text-2xl font-black tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
