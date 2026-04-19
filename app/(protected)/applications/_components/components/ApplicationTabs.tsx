"use client";

import { useId, useImperativeHandle, useRef } from "react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

import type { TabValue } from "../constants";
import type { ApplicationListItem } from "../types";

import { DONE_STATUSES, IN_PROGRESS_STATUSES } from "../constants";
import { ApplicationList } from "./ApplicationList";

const TAB_TRIGGER_CLASS =
  "group relative flex items-center gap-1.5 rounded-none px-1 pb-3 text-sm font-semibold transition-colors text-muted-foreground hover:text-foreground aria-selected:text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent aria-selected:after:bg-primary";

const BADGE_CLASS =
  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground transition-colors group-aria-selected:bg-primary/10 group-aria-selected:text-primary";

export type ApplicationTabsHandle = {
  scrollToTop: () => void;
};

type ApplicationTabsProps = {
  applications: ApplicationListItem[];
  className?: string;
  isFetchingNextPage?: boolean;
  onNearEndAction?: () => void;
  onRangeChangeAction?: (startIndex: number, endIndex: number) => void;
  onSelectApplicationAction: (application: ApplicationListItem) => void;
  onTabChangeAction: (tab: TabValue) => void;
  ref?: React.Ref<ApplicationTabsHandle>;
  tab: TabValue;
};

export function ApplicationTabs({
  applications,
  className,
  isFetchingNextPage,
  onNearEndAction,
  onRangeChangeAction,
  onSelectApplicationAction,
  onTabChangeAction,
  ref,
  tab,
}: ApplicationTabsProps) {
  const baseId = useId();
  const listRef = useRef<VirtualListHandle>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const inProgressApplications = applications.filter((a) =>
    IN_PROGRESS_STATUSES.includes(a.status),
  );
  const doneApplications = applications.filter((a) =>
    DONE_STATUSES.includes(a.status),
  );
  const tabItems: Array<{
    count: number;
    label: string;
    value: TabValue;
  }> = [
    { count: applications.length, label: "전체", value: "all" },
    { count: inProgressApplications.length, label: "진행중", value: "active" },
    { count: doneApplications.length, label: "완료", value: "done" },
  ];
  const selectedApplications = getApplicationsByTab({
    active: inProgressApplications,
    all: applications,
    done: doneApplications,
    tab,
  });
  const selectedTriggerId = `${baseId}-${tab}-trigger`;
  const selectedPanelId = `${baseId}-${tab}-panel`;

  useImperativeHandle(ref, () => ({
    scrollToTop: () => listRef.current?.scrollToIndex(0),
  }));

  function handleTabSelect(nextTab: TabValue) {
    if (nextTab === tab) {
      return;
    }

    trackEvent(ANALYTICS_EVENTS.APPLICATIONS_TAB_CHANGED, { tab: nextTab });
    // 탭 전환 시 GoToTopFAB 상태를 즉시 초기화합니다.
    // 새 목록이 렌더링되면 onRangeChangeAction(0, N)이 다시 호출됩니다.
    onRangeChangeAction?.(0, 0);
    onTabChangeAction(nextTab);
  }

  function handleTabListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabItems.findIndex((item) => item.value === tab);

    if (currentIndex < 0) {
      return;
    }

    const keyMap: Record<string, number> = {
      ArrowLeft: (currentIndex - 1 + tabItems.length) % tabItems.length,
      ArrowRight: (currentIndex + 1) % tabItems.length,
      End: tabItems.length - 1,
      Home: 0,
    };

    const nextIndex = keyMap[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextItem = tabItems[nextIndex];

    triggerRefs.current[nextIndex]?.focus();
    handleTabSelect(nextItem.value);
  }

  return (
    <div className={cn("flex flex-col", className ?? "h-full")}>
      <div className="border-b border-border/70 bg-background px-5 sm:px-6">
        <div
          aria-orientation="horizontal"
          className="flex h-auto items-end gap-5 rounded-none bg-transparent p-0"
          onKeyDown={handleTabListKeyDown}
          role="tablist"
        >
          {tabItems.map((item, index) => {
            const isSelected = item.value === tab;

            return (
              <button
                aria-controls={`${baseId}-${item.value}-panel`}
                aria-selected={isSelected}
                className={TAB_TRIGGER_CLASS}
                id={`${baseId}-${item.value}-trigger`}
                key={item.value}
                onClick={() => handleTabSelect(item.value)}
                ref={(node) => {
                  triggerRefs.current[index] = node;
                }}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {item.label}
                <span className={BADGE_CLASS}>{item.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-labelledby={selectedTriggerId}
        className="mt-0 min-h-0 flex-1 px-4 sm:px-5"
        id={selectedPanelId}
        role="tabpanel"
        tabIndex={0}
      >
        <ApplicationList
          applications={selectedApplications}
          emptyMessage={getEmptyMessage(tab)}
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEndAction}
          onRangeChange={onRangeChangeAction}
          onSelectApplication={onSelectApplicationAction}
          ref={listRef}
        />
      </div>
    </div>
  );
}

function getApplicationsByTab({
  active,
  all,
  done,
  tab,
}: {
  active: ApplicationListItem[];
  all: ApplicationListItem[];
  done: ApplicationListItem[];
  tab: TabValue;
}) {
  if (tab === "active") {
    return active;
  }

  if (tab === "done") {
    return done;
  }

  return all;
}

function getEmptyMessage(tab: TabValue) {
  if (tab === "active") {
    return "진행 중인 지원이 없습니다";
  }

  if (tab === "done") {
    return "완료된 지원이 없습니다";
  }

  return "아직 지원한 곳이 없습니다";
}
