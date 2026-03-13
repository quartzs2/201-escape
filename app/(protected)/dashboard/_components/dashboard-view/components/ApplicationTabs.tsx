"use client";

import { Tabs } from "@/components/ui";

import type { ApplicationListItem } from "../types";

import { DONE_STATUSES, IN_PROGRESS_STATUSES } from "../constants";
import { ApplicationList } from "./ApplicationList";

type ApplicationTabsProps = {
  applications: ApplicationListItem[];
};

const TAB_TRIGGER_CLASS =
  "h-12 flex-1 rounded-none border-b-2 border-transparent px-0 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

export function ApplicationTabs({ applications }: ApplicationTabsProps) {
  const inProgressApplications = applications.filter((a) =>
    IN_PROGRESS_STATUSES.includes(a.status),
  );
  const doneApplications = applications.filter((a) =>
    DONE_STATUSES.includes(a.status),
  );

  return (
    <Tabs defaultValue="all">
      <Tabs.List className="h-auto w-full rounded-none border-b border-border bg-transparent p-0">
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

      <Tabs.Content className="mt-0 px-5" value="all">
        <ApplicationList
          applications={applications}
          emptyMessage="아직 지원한 곳이 없습니다"
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 px-5" value="active">
        <ApplicationList
          applications={inProgressApplications}
          emptyMessage="진행 중인 지원이 없습니다"
        />
      </Tabs.Content>
      <Tabs.Content className="mt-0 px-5" value="done">
        <ApplicationList
          applications={doneApplications}
          emptyMessage="완료된 지원이 없습니다"
        />
      </Tabs.Content>
    </Tabs>
  );
}
