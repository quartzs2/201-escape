"use client";

import type { Route } from "next";

import { AlertCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import type {
  ApplicationListItem,
  GetApplicationsPage,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { Button } from "@/components/ui";
import { getApplications } from "@/lib/actions";

import type { PeriodPreset, SortValue, TabValue } from "../constants";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { ApplicationsPageHeader } from "../ApplicationsPageHeader";
import {
  getPeriodDateRange,
  PAGE_SIZE,
  parsePeriodParam,
  parseSortParam,
  parseTabParam,
  PERIOD_PARAM,
  PREVIEW_PARAM,
  SEARCH_PARAM,
  SORT_PARAM,
  TAB_PARAM,
} from "../constants";
import { GoToTopFAB } from "../go-to-top";
import { ApplicationFilters } from "./ApplicationFilters";
import { ApplicationTabs } from "./ApplicationTabs";

const ApplicationPreviewSheet = dynamic(
  () =>
    import("./ApplicationPreviewSheet").then(
      (module) => module.ApplicationPreviewSheet,
    ),
  { ssr: false },
);

type ApplicationsPanelProps = {
  dateLabel: string;
  initialPage: GetApplicationsPage;
};

export function ApplicationsPanel({
  dateLabel,
  initialPage,
}: ApplicationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const paginationSequenceRef = useRef(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isListScrolled, setIsListScrolled] = useState(false);
  const [isNavigatingFromPreview, setIsNavigatingFromPreview] = useState(false);
  const [pages, setPages] = useState<GetApplicationsPage[]>([initialPage]);
  const [paginationError, setPaginationError] = useState<null | string>(null);

  const search = searchParams.get(SEARCH_PARAM) ?? "";
  const period = parsePeriodParam(searchParams.get(PERIOD_PARAM));
  const sort = parseSortParam(searchParams.get(SORT_PARAM));
  const tab = parseTabParam(searchParams.get(TAB_PARAM));
  const previewApplicationId = searchParams.get(PREVIEW_PARAM);

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

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    router.replace(
      `${pathname}${query ? `?${query}` : ""}` as unknown as Route,
      { scroll: false },
    );
  }

  function handleSearchSubmit(nextSearch: string) {
    updateParams({ [PREVIEW_PARAM]: "", [SEARCH_PARAM]: nextSearch });
  }

  function handlePeriodChange(nextPeriod: PeriodPreset) {
    updateParams({
      [PERIOD_PARAM]: nextPeriod === "all" ? "" : nextPeriod,
      [PREVIEW_PARAM]: "",
    });
  }

  function handleSortChange(nextSort: SortValue) {
    updateParams({
      [PREVIEW_PARAM]: "",
      [SORT_PARAM]: nextSort === "applied_at_desc" ? "" : nextSort,
    });
  }

  function handleResetFilters() {
    updateParams({
      [PERIOD_PARAM]: "",
      [PREVIEW_PARAM]: "",
      [SEARCH_PARAM]: "",
      [SORT_PARAM]: "",
      [TAB_PARAM]: "",
    });
  }

  function handleTabChange(nextTab: TabValue) {
    updateParams({
      [PREVIEW_PARAM]: "",
      [TAB_PARAM]: nextTab === "all" ? "" : nextTab,
    });
  }

  function handleSelectApplication(application: ApplicationListItem) {
    setIsNavigatingFromPreview(false);
    updateParams({ [PREVIEW_PARAM]: application.id });
  }

  function handleClosePreview() {
    setIsNavigatingFromPreview(false);
    updateParams({ [PREVIEW_PARAM]: "" });
  }

  function handleDetailNavigate() {
    // iOS Safari bfcache가 "열린 시트" 상태를 스냅샷하지 않도록 상세 이동 직전에 프리뷰를 즉시 제거합니다.
    flushSync(() => {
      setIsNavigatingFromPreview(true);
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete(PREVIEW_PARAM);

    const query = params.toString();
    const nextUrl = `${pathname}${query ? `?${query}` : ""}`;

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
    <div className="flex flex-col gap-6">
      <ApplicationsPageHeader
        applications={applications}
        dateLabel={dateLabel}
        hasNextPage={hasNextPage}
        period={period}
        search={search}
        sort={sort}
        tab={tab}
      />

      <section className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-background">
        <ApplicationFilters
          onPeriodChangeAction={handlePeriodChange}
          onResetFiltersAction={handleResetFilters}
          onSearchSubmitAction={handleSearchSubmit}
          onSortChangeAction={handleSortChange}
          period={period}
          resultCount={applications.length}
          search={search}
          sort={sort}
        />
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
      </section>

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
