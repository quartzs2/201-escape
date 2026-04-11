"use client";

import { ChevronRightIcon } from "lucide-react";
import { usePostHog } from "posthog-js/react";

import { POSTHOG_EVENTS } from "@/lib/posthog/events";
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
  const posthog = usePostHog();
  const { badgeClassName, label } = STATUS_META[application.status];

  return (
    <div className="px-1 py-1.5">
      <button
        aria-label={`${application.companyName} ${application.positionTitle} 지원 미리보기 열기`}
        className={cn(
          "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-background p-4 text-left shadow-sm transition-all",
          "cursor-pointer hover:border-primary/20 hover:bg-primary/2 hover:shadow-md",
          "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:outline-none",
        )}
        onClick={() => {
          posthog.capture(POSTHOG_EVENTS.APPLICATION_PREVIEW_OPENED);
          onSelectAction(application);
        }}
        type="button"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              {application.companyName}
            </span>
            <span className="truncate text-sm font-medium text-muted-foreground">
              {application.positionTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                badgeClassName,
              )}
            >
              {label}
            </span>
            {application.platform !== "MANUAL" && (
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {PLATFORM_LABEL[application.platform]}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground/60">
          <span className="text-xs font-medium">
            <TimeAgo dateString={application.appliedAt} />
          </span>
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </div>
      </button>
    </div>
  );
}
