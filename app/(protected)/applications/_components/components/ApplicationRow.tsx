"use client";

import { ChevronRightIcon } from "lucide-react";

import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

import type { ApplicationListItem } from "../types";

import { PLATFORM_LABEL, STATUS_META } from "../constants";
import { TimeAgo } from "./TimeAgo";

type ApplicationRowProps = {
  application: ApplicationListItem;
  onSelectAction: (application: ApplicationListItem) => void;
};

export function ApplicationRow({
  application,
  onSelectAction,
}: ApplicationRowProps) {
  const { badgeClassName, label } = STATUS_META[application.status];

  return (
    <div className="border-b border-border/70">
      <button
        aria-label={`${application.companyName} ${application.positionTitle} 지원 미리보기 열기`}
        className={cn(
          "group flex min-h-[110px] w-full items-start justify-between gap-4 px-1 py-4 text-left transition-colors",
          "cursor-pointer hover:bg-muted/30",
          "focus-visible:rounded-2xl focus-visible:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:outline-none",
        )}
        onClick={() => {
          trackEvent(ANALYTICS_EVENTS.APPLICATION_PREVIEW_OPENED);
          onSelectAction(application);
        }}
        type="button"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col">
            <span className="text-[15px] leading-5 font-bold tracking-tight text-foreground">
              {application.companyName}
            </span>
            <span className="mt-1 truncate text-sm leading-6 font-medium text-muted-foreground">
              {application.positionTitle}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] leading-3 font-bold tracking-wider uppercase",
                badgeClassName,
              )}
            >
              {label}
            </span>
            {application.platform !== "MANUAL" && (
              <span className="text-[11px] leading-5 font-semibold tracking-wide text-muted-foreground uppercase">
                {PLATFORM_LABEL[application.platform]}
              </span>
            )}
            <span className="text-sm leading-5 text-muted-foreground/80">
              <TimeAgo dateString={application.appliedAt} />
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1 text-muted-foreground">
          <span className="hidden text-sm font-medium sm:block">미리보기</span>
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </div>
      </button>
    </div>
  );
}
