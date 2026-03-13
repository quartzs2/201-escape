import { getApplications } from "@/lib/actions";
import { cn, formatKoreanDate } from "@/lib/utils";

import { AddJobTrigger } from "../add-job";
import { GoToTopFAB } from "../go-to-top";
import { DashboardApplicationsPanel } from "./components/DashboardApplicationsPanel";
import { DOCS_STATUSES } from "./constants";

export async function DashboardView() {
  const applications = await getApplications();

  const stats = [
    { label: "전체", value: applications.length },
    {
      label: "서류",
      value: applications.filter((a) => DOCS_STATUSES.includes(a.status))
        .length,
    },
    {
      label: "면접",
      value: applications.filter((a) => a.status === "INTERVIEWING").length,
    },
    {
      label: "합격",
      value: applications.filter((a) => a.status === "OFFERED").length,
    },
  ];

  return (
    <main className="flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <p className="text-muted-foreground">{formatKoreanDate(new Date())}</p>
        <h1 className="mt-0.5 text-3xl text-foreground">지원 현황</h1>
      </div>

      <div className="grid grid-cols-4 border-y border-border">
        {stats.map((stat, i) => (
          <div
            className={cn(
              "flex flex-col items-center gap-1 py-5",
              i < stats.length - 1 && "border-r border-border",
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

      <DashboardApplicationsPanel applications={applications} />
      <GoToTopFAB />
      <AddJobTrigger />
    </main>
  );
}
