import { InboxIcon } from "lucide-react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Skeleton } from "@/components/ui";
import { VirtualList } from "@/components/ui/virtual-list";

import type { ApplicationListItem } from "../types";

import { ApplicationRow } from "./ApplicationRow";

// ApplicationRow의 실측 전 초기 높이 추정값(px).
const ESTIMATED_ROW_HEIGHT = 88;

// 끝에서 몇 개 전에 다음 페이지를 미리 로드할지.
const NEAR_END_THRESHOLD = 5;

type ApplicationListProps = {
  applications: ApplicationListItem[];
  emptyMessage?: string;
  isFetchingNextPage?: boolean;
  onNearEnd?: () => void;
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  onSelectApplication: (application: ApplicationListItem) => void;
  ref?: React.Ref<VirtualListHandle>;
};

export function ApplicationList({
  applications,
  emptyMessage = "해당하는 지원 내역이 없습니다",
  isFetchingNextPage,
  onNearEnd,
  onRangeChange,
  onSelectApplication,
  ref,
}: ApplicationListProps) {
  const handleRangeChange = (startIndex: number, endIndex: number) => {
    onRangeChange?.(startIndex, endIndex);
    if (onNearEnd && endIndex >= applications.length - NEAR_END_THRESHOLD) {
      onNearEnd();
    }
  };

  const emptyState = (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <InboxIcon className="size-8 stroke-[1.5]" />
      <p className="text-sm">{emptyMessage}</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <VirtualList
        aria-label="지원서 목록"
        className="flex-1"
        emptyState={emptyState}
        estimatedItemHeight={ESTIMATED_ROW_HEIGHT}
        items={applications}
        keyExtractor={(item) => item.id}
        onRangeChange={handleRangeChange}
        ref={ref}
        renderItem={(item) => (
          <ApplicationRow application={item} onSelect={onSelectApplication} />
        )}
      />
      {isFetchingNextPage && (
        <div
          aria-label="추가 항목을 불러오는 중입니다"
          aria-live="polite"
          role="status"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <ApplicationRowSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationRowSkeleton() {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-border py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="size-4" />
      </div>
    </div>
  );
}
