"use client";

import { usePostHog } from "posthog-js/react";
import { useImperativeHandle, useRef } from "react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Tabs } from "@/components/ui";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { cn } from "@/lib/utils";

import type { ApplicationListItem } from "../types";

import { DONE_STATUSES, IN_PROGRESS_STATUSES } from "../constants";
import { ApplicationList } from "./ApplicationList";

const TAB_TRIGGER_CLASS =
  "h-9 flex-1 rounded-full px-3 text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-muted-foreground hover:text-foreground";

export type ApplicationTabsHandle = {
  scrollToTop: () => void;
};

type ApplicationTabsProps = {
  applications: ApplicationListItem[];
  className?: string;
  isFetchingNextPage?: boolean;
  onNearEnd?: () => void;
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  onSelectApplication: (application: ApplicationListItem) => void;
  ref?: React.Ref<ApplicationTabsHandle>;
};

export function ApplicationTabs({
  applications,
  className,
  isFetchingNextPage,
  onNearEnd,
  onRangeChange,
  onSelectApplication,
  ref,
}: ApplicationTabsProps) {
  const posthog = usePostHog();

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
      defaultValue="all"
      onValueChange={(value) => {
        posthog.capture(POSTHOG_EVENTS.DASHBOARD_TAB_CHANGED, { tab: value });
        // 탭 전환 시 GoToTopFAB 상태를 즉시 초기화합니다.
        // 새 탭의 VirtualList가 마운트되면 onRangeChange(0, N)이 다시 호출됩니다.
        onRangeChange?.(0, 0);
      }}
    >
      <div className="px-5 py-4">
        <Tabs.List className="flex h-11 w-full items-center gap-1 rounded-2xl bg-muted/50 p-1 shadow-inner">
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="all">
            전체
          </Tabs.Trigger>
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="active">
            진행중
          </Tabs.Trigger>
          <Tabs.Trigger className={TAB_TRIGGER_CLASS} value="done">
            완료
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4" value="all">
        <ApplicationList
          applications={applications}
          emptyMessage="아직 지원한 곳이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEnd}
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4" value="active">
        <ApplicationList
          applications={inProgressApplications}
          emptyMessage="진행 중인 지원이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEnd}
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-4" value="done">
        <ApplicationList
          applications={doneApplications}
          emptyMessage="완료된 지원이 없습니다"
          isFetchingNextPage={isFetchingNextPage}
          onNearEnd={onNearEnd}
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
    </Tabs>
  );
}
