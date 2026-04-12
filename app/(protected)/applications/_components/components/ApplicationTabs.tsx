"use client";

import { useImperativeHandle, useRef } from "react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Tabs } from "@/components/ui";
import { trackEvent } from "@/lib/posthog/client";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { cn } from "@/lib/utils";

import type { TabValue } from "../constants";
import type { ApplicationListItem } from "../types";

import { DONE_STATUSES, IN_PROGRESS_STATUSES } from "../constants";
import { ApplicationList } from "./ApplicationList";

const TAB_TRIGGER_CLASS =
  "group relative flex items-center gap-1.5 rounded-none px-1 pb-3 text-sm font-semibold transition-colors text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-primary";

const BADGE_CLASS =
  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground transition-colors group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary";

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
  /**
   * TabsContent의 forceMount 기본값이 false이므로 활성 탭 하나만 렌더링됩니다.
   * 따라서 listRef 하나로 현재 활성 탭의 VirtualList를 참조할 수 있습니다.
   */
  const listRef = useRef<VirtualListHandle>(null);

  const inProgressApplications = applications.filter((a) =>
    IN_PROGRESS_STATUSES.includes(a.status),
  );
  const doneApplications = applications.filter((a) =>
    DONE_STATUSES.includes(a.status),
  );

  useImperativeHandle(ref, () => ({
    scrollToTop: () => listRef.current?.scrollToIndex(0),
  }));

  return (
    <Tabs
      className={cn("flex flex-col", className ?? "h-full")}
      onValueChange={(value) => {
        trackEvent(POSTHOG_EVENTS.APPLICATIONS_TAB_CHANGED, {
          tab: value,
        });
        // 탭 전환 시 GoToTopFAB 상태를 즉시 초기화합니다.
        // 새 탭의 VirtualList가 마운트되면 onRangeChangeAction(0, N)이 다시 호출됩니다.
        onRangeChangeAction?.(0, 0);
        onTabChangeAction(value as TabValue);
      }}
      value={tab}
    >
      <div className="border-b border-border/70 bg-background px-5 sm:px-6">
        <Tabs.List className="flex h-auto items-end gap-5 rounded-none bg-transparent p-0">
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="all">
            전체
            <span className={BADGE_CLASS}>{applications.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="active">
            진행중
            <span className={BADGE_CLASS}>{inProgressApplications.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="done">
            완료
            <span className={BADGE_CLASS}>{doneApplications.length}</span>
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4 sm:px-5" value="all">
        <ApplicationList
          applications={applications}
          emptyMessage="아직 지원한 곳이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEndAction}
          onRangeChange={onRangeChangeAction}
          onSelectApplication={onSelectApplicationAction}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4 sm:px-5" value="active">
        <ApplicationList
          applications={inProgressApplications}
          emptyMessage="진행 중인 지원이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEndAction}
          onRangeChange={onRangeChangeAction}
          onSelectApplication={onSelectApplicationAction}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4 sm:px-5" value="done">
        <ApplicationList
          applications={doneApplications}
          emptyMessage="완료된 지원이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEndAction}
          onRangeChange={onRangeChangeAction}
          onSelectApplication={onSelectApplicationAction}
          ref={listRef}
        />
      </Tabs.Content>
    </Tabs>
  );
}
