"use client";

import type { Route } from "next";

import { AlertCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type {
  ApplicationListItem,
  ApplicationTabCounts,
  GetApplicationsPage,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { Button } from "@/components/ui/button/Button";
import { getApplications } from "@/lib/actions/getApplications";

import type { PeriodPreset, SortValue, TabValue } from "../constants";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { buildApplicationsHref } from "../../_utils/route-state";
import { DONE_STATUSES, IN_PROGRESS_STATUSES, PAGE_SIZE } from "../constants";
import { GoToTopFAB } from "../go-to-top";
import { ApplicationTabs } from "./ApplicationTabs";

const ApplicationPreviewSheet = dynamic(
  () =>
    import("./ApplicationPreviewSheet").then(
      (module) => module.ApplicationPreviewSheet,
    ),
  { ssr: false },
);

type ApplicationsPanelClientProps = {
  initialPage: GetApplicationsPage;
  period: PeriodPreset;
  periodEnd?: string;
  periodStart?: string;
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

export function ApplicationsPanelClient({
  initialPage,
  period,
  periodEnd,
  periodStart,
  previewApplicationId,
  search,
  sort,
  tab,
}: ApplicationsPanelClientProps) {
  const router = useRouter();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const initialPageRef = useRef(initialPage);
  const paginationSequenceRef = useRef(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isListScrolled, setIsListScrolled] = useState(false);
  const [isNavigatingFromPreview, setIsNavigatingFromPreview] = useState(false);
  const [listResetVersion, setListResetVersion] = useState(0);
  const [localPreviewApplicationId, setLocalPreviewApplicationId] = useState<
    null | string
  >(previewApplicationId);
  const [pages, setPages] = useState<GetApplicationsPage[]>([initialPage]);
  const [paginationError, setPaginationError] = useState<null | string>(null);
  const [tabCounts, setTabCounts] = useState<ApplicationTabCounts>(
    initialPage.tabCounts,
  );

  const applications = pages.flatMap((page) => page.items);
  const hasNextPage = pages[pages.length - 1]?.hasMore ?? false;
  const selectedApplication =
    applications.find(
      (application) => application.id === localPreviewApplicationId,
    ) ?? null;
  const shouldRenderPreview =
    localPreviewApplicationId !== null &&
    !isNavigatingFromPreview &&
    selectedApplication !== null;

  useEffect(() => {
    setLocalPreviewApplicationId(previewApplicationId);
  }, [previewApplicationId]);

  useLayoutEffect(() => {
    if (initialPageRef.current === initialPage) {
      return;
    }

    initialPageRef.current = initialPage;
    paginationSequenceRef.current += 1;
    setPages([initialPage]);
    setTabCounts(initialPage.tabCounts);
    setPaginationError(null);
    setIsFetchingNextPage(false);
    setIsListScrolled(false);
    setListResetVersion((version) => version + 1);
  }, [initialPage]);

  function updateRoute(nextState: RouteStateUpdate) {
    const nextPreviewApplicationId =
      nextState.previewApplicationId !== undefined
        ? nextState.previewApplicationId
        : localPreviewApplicationId;

    if (nextState.previewApplicationId !== undefined) {
      setLocalPreviewApplicationId(nextPreviewApplicationId);
    }

    const href = buildApplicationsHref({
      period: nextState.period ?? period,
      previewApplicationId: nextPreviewApplicationId,
      search: nextState.search ?? search,
      sort: nextState.sort ?? sort,
      tab: nextState.tab ?? tab,
    });

    router.replace(href as Route, { scroll: false });
  }

  function updatePreviewHistory(nextPreviewApplicationId: null | string) {
    const href = buildApplicationsHref({
      period,
      previewApplicationId: nextPreviewApplicationId,
      search,
      sort,
      tab,
    });

    window.history.replaceState(window.history.state, "", href);
  }

  function handleTabChange(nextTab: TabValue) {
    updateRoute({
      previewApplicationId: null,
      tab: nextTab,
    });
  }

  function handleSelectApplication(application: ApplicationListItem) {
    setIsNavigatingFromPreview(false);
    setLocalPreviewApplicationId(application.id);
    // preview는 서버 데이터가 아니라 목록 위의 UI 상태이므로 App Router 재요청 없이 URL만 동기화합니다.
    updatePreviewHistory(application.id);
  }

  function handleClosePreview() {
    setIsNavigatingFromPreview(false);
    setLocalPreviewApplicationId(null);
    updatePreviewHistory(null);
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
    const previousStatus =
      applications.find((application) => application.id === applicationId)
        ?.status ?? null;

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

    if (previousStatus !== null && previousStatus !== nextStatus) {
      setTabCounts((currentCounts) =>
        getStatusChangeTabCounts({
          counts: currentCounts,
          nextStatus,
          previousStatus,
        }),
      );
    }
  }

  function handleDeleteApplication(applicationId: string) {
    const deletedApplication =
      applications.find((application) => application.id === applicationId) ??
      null;

    setIsNavigatingFromPreview(false);
    setLocalPreviewApplicationId(null);
    setPages((currentPages) =>
      currentPages.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.id !== applicationId),
      })),
    );
    if (deletedApplication !== null) {
      setTabCounts((currentCounts) =>
        getDeleteTabCounts(currentCounts, deletedApplication.status),
      );
    }
    updatePreviewHistory(null);
    router.refresh();
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
      periodEnd,
      periodStart,
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
    <>
      <ApplicationTabs
        applications={applications}
        className="h-[32rem] min-h-0 sm:h-[36rem] lg:h-[40rem]"
        counts={tabCounts}
        isFetchingNextPage={isFetchingNextPage}
        listResetKey={listResetVersion}
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
            <div className="flex items-start gap-2 text-sm text-destructive">
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
          onDeleteSuccessAction={handleDeleteApplication}
          onDetailNavigateAction={handleDetailNavigate}
          onStatusChangeAction={handleStatusChange}
        />
      ) : null}

      <GoToTopFAB
        className="md:bottom-24"
        isVisible={isListScrolled}
        onScrollToTop={() => tabsRef.current?.scrollToTop()}
      />
    </>
  );
}

function getDeleteTabCounts(
  counts: ApplicationTabCounts,
  deletedStatus: JobStatus,
): ApplicationTabCounts {
  return {
    active: Math.max(
      0,
      counts.active - (IN_PROGRESS_STATUSES.includes(deletedStatus) ? 1 : 0),
    ),
    all: Math.max(0, counts.all - 1),
    done: Math.max(
      0,
      counts.done - (DONE_STATUSES.includes(deletedStatus) ? 1 : 0),
    ),
  };
}

function getStatusChangeTabCounts({
  counts,
  nextStatus,
  previousStatus,
}: {
  counts: ApplicationTabCounts;
  nextStatus: JobStatus;
  previousStatus: JobStatus;
}): ApplicationTabCounts {
  return {
    active:
      counts.active +
      getStatusGroupDelta(previousStatus, nextStatus, IN_PROGRESS_STATUSES),
    all: counts.all,
    done:
      counts.done +
      getStatusGroupDelta(previousStatus, nextStatus, DONE_STATUSES),
  };
}

function getStatusGroupDelta(
  previousStatus: JobStatus,
  nextStatus: JobStatus,
  statuses: readonly JobStatus[],
): number {
  const wasIncluded = statuses.includes(previousStatus);
  const isIncluded = statuses.includes(nextStatus);

  if (wasIncluded === isIncluded) {
    return 0;
  }

  return isIncluded ? 1 : -1;
}
