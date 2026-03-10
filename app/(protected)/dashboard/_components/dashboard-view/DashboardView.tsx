import { cn, formatKoreanDate } from "@/lib/utils";

import { ApplicationTabs } from "./components/ApplicationTabs";
import { STATS } from "./mock-data";

export function DashboardView() {
  return (
    <main className="flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <p className="text-muted-foreground">{formatKoreanDate(new Date())}</p>
        <h1 className="mt-0.5 text-3xl text-foreground">지원 현황</h1>
      </div>

      <div className="grid grid-cols-4 border-y border-border">
        {STATS.map((stat, i) => (
          <div
            className={cn(
              "flex flex-col items-center gap-1 py-5",
              i < STATS.length - 1 && "border-r border-border",
            )}
            key={stat.label}
          >
            <span className="text-xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <ApplicationTabs />
    </main>
  );
}
