import { InboxIcon } from "lucide-react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { VirtualList } from "@/components/ui/virtual-list";

import type { ApplicationListItem } from "../types";

import { ApplicationRow } from "./ApplicationRow";

// ApplicationRow의 실측 전 초기 높이 추정값(px).
// py-4(32) + 회사명(22.5) + 직군명(21) + gap-2(8) + 상태행(21) ≈ 105
const ESTIMATED_ROW_HEIGHT = 105;

// 끝에서 몇 개 전에 다음 페이지를 미리 로드할지.
const NEAR_END_THRESHOLD = 5;
const PAGINATION_SKELETON_KEYS = [0, 1, 2] as const;

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
    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
      <InboxIcon className="size-8 stroke-[1.5]" />
      <p className="text-sm font-medium">{emptyMessage}</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <VirtualList
        aria-label="지원서 목록"
        className="flex-1 pt-2"
        emptyState={emptyState}
        estimatedItemHeight={ESTIMATED_ROW_HEIGHT}
        items={applications}
        keyExtractor={(item) => item.id}
        onRangeChange={handleRangeChange}
        ref={ref}
        renderItem={(item) => (
          <ApplicationRow
            application={item}
            onSelectAction={onSelectApplication}
          />
        )}
      />
      {!isFetchingNextPage && <div className="h-10 shrink-0" />}

      {isFetchingNextPage && (
        <div
          aria-label="추가 항목을 불러오는 중입니다"
          aria-live="polite"
          className="pb-10"
          role="status"
        >
          {PAGINATION_SKELETON_KEYS.map((key) => (
            <ApplicationRowSkeleton key={key} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationRowSkeleton() {
  return (
    <div className="border-b border-border/70 py-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4.5 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="size-4" />
        </div>
      </div>
    </div>
  );
}
