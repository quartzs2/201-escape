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
    <div className="border-b border-border/70">
      <button
        aria-label={`${application.companyName} ${application.positionTitle} 지원 미리보기 열기`}
        className={cn(
          "group flex w-full items-start justify-between gap-4 px-1 py-4 text-left transition-colors",
          "cursor-pointer hover:bg-muted/30",
          "focus-visible:rounded-2xl focus-visible:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:outline-none",
        )}
        onClick={() => {
          posthog.capture(POSTHOG_EVENTS.APPLICATION_PREVIEW_OPENED);
          onSelectAction(application);
        }}
        type="button"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              {application.companyName}
            </span>
            <span className="truncate text-sm leading-6 font-medium text-muted-foreground">
              {application.positionTitle}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase",
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
            <span className="text-xs text-muted-foreground/80">
              <TimeAgo dateString={application.appliedAt} />
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1 text-muted-foreground">
          <span className="hidden text-xs font-medium sm:block">미리보기</span>
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </button>
    </div>
  );
}
