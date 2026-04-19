"use client";

import type { Route } from "next";

import { AlertCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import type {
  ApplicationListItem,
  GetApplicationsPage,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { Button } from "@/components/ui/button/Button";
import { getApplications } from "@/lib/actions";

import type { PeriodPreset, SortValue, TabValue } from "../constants";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { buildApplicationsHref } from "../../_utils/route-state";
import { getPeriodDateRange, PAGE_SIZE } from "../constants";
import { GoToTopFAB } from "../go-to-top";
import { ApplicationTabs } from "./ApplicationTabs";

const ApplicationPreviewSheet = dynamic(
  () =>
    import("./ApplicationPreviewSheet").then(
      (module) => module.ApplicationPreviewSheet,
    ),
  { ssr: false },
);

type ApplicationsPanelProps = {
  initialPage: GetApplicationsPage;
  period: PeriodPreset;
  previewApplicationId: null | string;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

type RouteStateUpdate = {
  period?: PeriodPreset;
  previewApplicationId?: null | string;
  search?: string;
  sort?: SortValue;
  tab?: TabValue;
};

export function ApplicationsPanel({
  initialPage,
  period,
  previewApplicationId,
  search,
  sort,
  tab,
}: ApplicationsPanelProps) {
  const router = useRouter();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const paginationSequenceRef = useRef(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isListScrolled, setIsListScrolled] = useState(false);
  const [isNavigatingFromPreview, setIsNavigatingFromPreview] = useState(false);
  const [pages, setPages] = useState<GetApplicationsPage[]>([initialPage]);
  const [paginationError, setPaginationError] = useState<null | string>(null);

  const dateRange = getPeriodDateRange(period);
  const applications = pages.flatMap((page) => page.items);
  const hasNextPage = pages[pages.length - 1]?.hasMore ?? false;
  const selectedApplication =
    applications.find(
      (application) => application.id === previewApplicationId,
    ) ?? null;
  const shouldRenderPreview =
    previewApplicationId !== null &&
    !isNavigatingFromPreview &&
    selectedApplication !== null;

  function updateRoute(nextState: RouteStateUpdate) {
    const href = buildApplicationsHref({
      period: nextState.period ?? period,
      previewApplicationId:
        nextState.previewApplicationId !== undefined
          ? nextState.previewApplicationId
          : previewApplicationId,
      search: nextState.search ?? search,
      sort: nextState.sort ?? sort,
      tab: nextState.tab ?? tab,
    });

    router.replace(href as Route, { scroll: false });
  }

  function handleTabChange(nextTab: TabValue) {
    updateRoute({
      previewApplicationId: null,
      tab: nextTab,
    });
  }

  function handleSelectApplication(application: ApplicationListItem) {
    setIsNavigatingFromPreview(false);
    updateRoute({ previewApplicationId: application.id });
  }

  function handleClosePreview() {
    setIsNavigatingFromPreview(false);
    updateRoute({ previewApplicationId: null });
  }

  function handleDetailNavigate() {
    // iOS Safari bfcache가 "열린 시트" 상태를 스냅샷하지 않도록 상세 이동 직전에 프리뷰를 즉시 제거합니다.
    flushSync(() => {
      setIsNavigatingFromPreview(true);
    });

    const nextUrl = buildApplicationsHref({
      period,
      previewApplicationId: null,
      search,
      sort,
      tab,
    });

    window.history.replaceState(window.history.state, "", nextUrl);
  }

  function handleStatusChange(applicationId: string, nextStatus: JobStatus) {
    setPages((currentPages) =>
      currentPages.map((page) => ({
        ...page,
        items: page.items.map((item) => {
          if (item.id !== applicationId) {
            return item;
          }

          return { ...item, status: nextStatus };
        }),
      })),
    );
  }

  async function handleNearEnd() {
    if (isFetchingNextPage || !hasNextPage) {
      return;
    }

    const activeSequence = paginationSequenceRef.current;

    setIsFetchingNextPage(true);
    setPaginationError(null);

    const result = await getApplications({
      limit: PAGE_SIZE,
      offset: applications.length,
      periodEnd: dateRange?.end,
      periodStart: dateRange?.start,
      search: search || undefined,
      sort,
    });

    if (paginationSequenceRef.current !== activeSequence) {
      return;
    }

    if (!result.ok) {
      setPaginationError(result.reason);
      setIsFetchingNextPage(false);
      return;
    }

    setPages((currentPages) => [...currentPages, result.data]);
    setIsFetchingNextPage(false);
  }

  return (
    <div className="flex flex-col">
      <ApplicationTabs
        applications={applications}
        className="h-[32rem] min-h-0 sm:h-[36rem] lg:h-[40rem]"
        isFetchingNextPage={isFetchingNextPage}
        onNearEndAction={() => {
          void handleNearEnd();
        }}
        onRangeChangeAction={(startIndex: number) =>
          setIsListScrolled(startIndex > 0)
        }
        onSelectApplicationAction={handleSelectApplication}
        onTabChangeAction={handleTabChange}
        ref={tabsRef}
        tab={tab}
      />

      {paginationError ? (
        <div
          aria-live="polite"
          className="border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6"
          role="status"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircleIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <p>추가 목록을 불러오지 못했습니다. {paginationError}</p>
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                void handleNearEnd();
              }}
              size="sm"
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        </div>
      ) : null}

      {shouldRenderPreview ? (
        <ApplicationPreviewSheet
          application={selectedApplication}
          isOpen={true}
          onCloseAction={handleClosePreview}
          onDetailNavigateAction={handleDetailNavigate}
          onStatusChangeAction={handleStatusChange}
        />
      ) : null}

      <GoToTopFAB
        className="md:bottom-24"
        isVisible={isListScrolled}
        onScrollToTop={() => tabsRef.current?.scrollToTop()}
      />
    </div>
  );
}
