import { InboxIcon } from "lucide-react";

import type { VirtualListHandle } from "@/components/ui/virtual-list";

import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { VirtualList } from "@/components/ui/virtual-list";

import type { ApplicationListItem } from "../types";

import { ApplicationRow } from "./ApplicationRow";

// ApplicationRow의 실측 전 초기 높이 추정값(px).
// py-4(32) + 제목 영역(48) + gap-2.5(10) + 메타 행(20) + border-b(1) = 111
const ESTIMATED_ROW_HEIGHT = 111;

// 끝에서 몇 개 전에 다음 페이지를 미리 로드할지.
const NEAR_END_THRESHOLD = 5;
const PAGINATION_SKELETON_KEYS = [0, 1, 2] as const;
const LIST_PADDING_BOTTOM = 40;

type ApplicationListProps = {
  applications: ApplicationListItem[];
  emptyMessage?: string;
  isFetchingNextPage?: boolean;
  onNearEnd?: () => void;
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  onSelectApplication: (application: ApplicationListItem) => void;
  ref?: React.Ref<VirtualListHandle>;
  resetKey?: number | string;
};

type ApplicationListRow =
  | {
      application: ApplicationListItem;
      type: "application";
    }
  | {
      id: string;
      type: "skeleton";
    };

export function ApplicationList({
  applications,
  emptyMessage = "해당하는 지원 내역이 없습니다",
  isFetchingNextPage,
  onNearEnd,
  onRangeChange,
  onSelectApplication,
  ref,
  resetKey,
}: ApplicationListProps) {
  const rows: ApplicationListRow[] = [
    ...applications.map((application) => ({
      application,
      type: "application" as const,
    })),
    ...(isFetchingNextPage
      ? PAGINATION_SKELETON_KEYS.map((key) => ({
          id: `pagination-skeleton-${key}`,
          type: "skeleton" as const,
        }))
      : []),
  ];

  const handleRangeChange = (startIndex: number, endIndex: number) => {
    onRangeChange?.(startIndex, endIndex);
    if (
      onNearEnd &&
      !isFetchingNextPage &&
      endIndex >= applications.length - NEAR_END_THRESHOLD
    ) {
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
        items={rows}
        keyExtractor={(item) =>
          item.type === "application" ? item.application.id : item.id
        }
        onRangeChange={handleRangeChange}
        paddingBottom={LIST_PADDING_BOTTOM}
        ref={ref}
        renderItem={(item, index) => {
          if (item.type === "skeleton") {
            return (
              <ApplicationRowSkeleton
                shouldAnnounce={index === applications.length}
              />
            );
          }

          return (
            <ApplicationRow
              application={item.application}
              onSelectAction={onSelectApplication}
            />
          );
        }}
        resetKey={resetKey}
      />
    </div>
  );
}

function ApplicationRowSkeleton({
  shouldAnnounce,
}: {
  shouldAnnounce: boolean;
}) {
  return (
    <div
      aria-label={shouldAnnounce ? "추가 항목을 불러오는 중입니다" : undefined}
      aria-live={shouldAnnounce ? "polite" : undefined}
      className="border-b border-border/70"
      role={shouldAnnounce ? "status" : undefined}
    >
      <div className="flex min-h-[110px] w-full items-start justify-between gap-4 px-1 py-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col">
            <Skeleton className="mt-0.5 h-4.5 w-24" />
            <Skeleton className="mt-1 h-6 w-40" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <Skeleton className="hidden h-5 w-12 sm:block" />
          <Skeleton className="size-4" />
        </div>
      </div>
    </div>
  );
}
