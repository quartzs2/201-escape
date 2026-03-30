import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ApplicationListItem } from "../types";

import { PLATFORM_LABEL, STATUS_META } from "../constants";
import { TimeAgo } from "./TimeAgo";

type ApplicationRowProps = {
  application: ApplicationListItem;
  onSelect: (application: ApplicationListItem) => void;
};

export function ApplicationRow({ application, onSelect }: ApplicationRowProps) {
  const { color, label } = STATUS_META[application.status];

  return (
    <button
      aria-label={`${application.companyName} ${application.positionTitle} 지원 미리보기 열기`}
      className={cn(
        "flex w-full items-start justify-between gap-4 border-b border-border py-4 text-left",
        "cursor-pointer transition-colors",
        "hover:bg-muted/60",
        "focus-visible:rounded-xl focus-visible:border-transparent focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "active:bg-muted",
      )}
      onClick={() => {
        onSelect(application);
      }}
      type="button"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-foreground">
            {application.companyName}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {application.positionTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-sm font-medium", color)}>{label}</span>
          {application.platform !== "MANUAL" && (
            <>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {PLATFORM_LABEL[application.platform]}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        <span className="text-sm">
          <TimeAgo dateString={application.appliedAt} />
        </span>
        <ChevronRightIcon aria-hidden="true" className="mt-0.5 size-4" />
      </div>
    </button>
  );
}
