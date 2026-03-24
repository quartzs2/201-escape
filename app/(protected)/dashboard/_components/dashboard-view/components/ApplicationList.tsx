import { InboxIcon } from "lucide-react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { VirtualList } from "@/components/ui/virtual-list";

import type { ApplicationListItem } from "../types";

import { ApplicationRow } from "./ApplicationRow";

// ApplicationRow의 실측 전 초기 높이 추정값(px).
const ESTIMATED_ROW_HEIGHT = 88;

type ApplicationListProps = {
  applications: ApplicationListItem[];
  emptyMessage?: string;
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  onSelectApplication: (application: ApplicationListItem) => void;
  ref?: React.Ref<VirtualListHandle>;
};

export function ApplicationList({
  applications,
  emptyMessage = "해당하는 지원 내역이 없습니다",
  onRangeChange,
  onSelectApplication,
  ref,
}: ApplicationListProps) {
  const emptyState = (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <InboxIcon className="size-8 stroke-[1.5]" />
      <p className="text-sm">{emptyMessage}</p>
    </div>
  );

  return (
    <VirtualList
      aria-label="지원서 목록"
      className="h-full"
      emptyState={emptyState}
      estimatedItemHeight={ESTIMATED_ROW_HEIGHT}
      items={applications}
      keyExtractor={(item) => item.id}
      onRangeChange={onRangeChange}
      ref={ref}
      renderItem={(item) => (
        <ApplicationRow application={item} onSelect={onSelectApplication} />
      )}
    />
  );
}
