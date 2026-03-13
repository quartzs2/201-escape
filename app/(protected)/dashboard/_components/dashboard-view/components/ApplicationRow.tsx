import { cn, getTimeAgo } from "@/lib/utils";

import type { ApplicationListItem } from "../types";

import { PLATFORM_LABEL, STATUS_META } from "../constants";

type ApplicationRowProps = {
  application: ApplicationListItem;
};

export function ApplicationRow({ application }: ApplicationRowProps) {
  const { color, label } = STATUS_META[application.status];

  return (
    <div className="flex items-start justify-between border-b border-border py-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-foreground">
            {application.companyName}
          </span>
          <span className="text-sm text-muted-foreground">
            {application.positionTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-sm font-medium", color)}>{label}</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">
            {PLATFORM_LABEL[application.platform]}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        {getTimeAgo(application.appliedAt)}
      </span>
    </div>
  );
}
