import { Inbox } from "lucide-react";

import type { ApplicationItem } from "../types";

import { ApplicationRow } from "./ApplicationRow";

type ApplicationListProps = {
  applications: ApplicationItem[];
  emptyMessage?: string;
};

export function ApplicationList({
  applications,
  emptyMessage = "해당하는 지원 내역이 없습니다",
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <Inbox className="size-8 stroke-[1.5]" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <ApplicationRow application={application} key={application.id} />
      ))}
    </>
  );
}
