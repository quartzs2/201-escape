import { useImperativeHandle, useRef } from "react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Tabs } from "@/components/ui";

import type { ApplicationListItem } from "../types";

import { DONE_STATUSES, IN_PROGRESS_STATUSES } from "../constants";
import { ApplicationList } from "./ApplicationList";

const TAB_TRIGGER_CLASS =
  "h-12 flex-1 rounded-none border-b-2 border-transparent px-0 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

export type ApplicationTabsHandle = {
  scrollToTop: () => void;
};

type ApplicationTabsProps = {
  applications: ApplicationListItem[];
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  onSelectApplication: (application: ApplicationListItem) => void;
  ref?: React.Ref<ApplicationTabsHandle>;
};

export function ApplicationTabs({
  applications,
  onRangeChange,
  onSelectApplication,
  ref,
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
      className="flex h-full flex-col"
      defaultValue="all"
      onValueChange={() => {
        // 탭 전환 시 GoToTopFAB 상태를 즉시 초기화합니다.
        // 새 탭의 VirtualList가 마운트되면 onRangeChange(0, N)이 다시 호출됩니다.
        onRangeChange?.(0, 0);
      }}
    >
      <Tabs.List className="h-auto w-full shrink-0 rounded-none border-b border-border bg-transparent p-0">
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

      <Tabs.Content className="mt-0 min-h-0 flex-1 px-5" value="all">
        <ApplicationList
          applications={applications}
          emptyMessage="아직 지원한 곳이 없습니다"
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-5" value="active">
        <ApplicationList
          applications={inProgressApplications}
          emptyMessage="진행 중인 지원이 없습니다"
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 min-h-0 flex-1 px-5" value="done">
        <ApplicationList
          applications={doneApplications}
          emptyMessage="완료된 지원이 없습니다"
          onRangeChange={onRangeChange}
          onSelectApplication={onSelectApplication}
          ref={listRef}
        />
      </Tabs.Content>
    </Tabs>
  );
}
