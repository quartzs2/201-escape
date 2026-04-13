"use client";

import type { Route } from "next";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { JobStatus } from "@/lib/types/job";

import { Button } from "@/components/ui/button/Button";
import { getApplications } from "@/lib/actions";

import type { PeriodPreset, SortValue, TabValue } from "../constants";
import type { ApplicationListItem } from "../types";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { ApplicationsPageHeader } from "../ApplicationsPageHeader";
import {
  getPeriodDateRange,
  PAGE_SIZE,
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
  initialApplications: ApplicationListItem[];
  initialHasNextPage: boolean;
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

export function ApplicationsPanel({
  dateLabel,
  initialApplications,
  initialHasNextPage,
  period,
  search,
  sort,
  tab,
}: ApplicationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const isFetchingNextPageRef = useRef(false);
  const [applications, setApplications] =
    useState<ApplicationListItem[]>(initialApplications);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isListScrolled, setIsListScrolled] = useState(false);
  const [paginationErrorMessage, setPaginationErrorMessage] = useState<
    null | string
  >(null);
  const [previewApplicationId, setPreviewApplicationId] = useState<
    null | string
  >(null);
  const [shouldRenderPreviewSheet, setShouldRenderPreviewSheet] =
    useState(false);

  const isPreviewOpen = previewApplicationId !== null;
  const selectedApplication =
    applications.find((a) => a.id === previewApplicationId) ?? null;

  useEffect(() => {
    const previewParam = searchParams.get(PREVIEW_PARAM);

    if (!previewParam) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(PREVIEW_PARAM);
    const query = params.toString();

    router.replace(
      `${pathname}${query ? `?${query}` : ""}` as unknown as Route,
      { scroll: false },
    );
  }, [pathname, router, searchParams]);

  const updateParams = (updates: Record<string, string>) => {
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
  };

  const handleSearchSubmit = (nextSearch: string) => {
    setPreviewApplicationId(null);
    updateParams({ [SEARCH_PARAM]: nextSearch });
  };

  const handlePeriodChange = (nextPeriod: PeriodPreset) => {
    setPreviewApplicationId(null);
    updateParams({
      [PERIOD_PARAM]: nextPeriod === "all" ? "" : nextPeriod,
    });
  };

  const handleSortChange = (nextSort: SortValue) => {
    setPreviewApplicationId(null);
    updateParams({
      [SORT_PARAM]: nextSort === "applied_at_desc" ? "" : nextSort,
    });
  };

  const handleResetFilters = () => {
    setPreviewApplicationId(null);
    updateParams({
      [PERIOD_PARAM]: "",
      [SEARCH_PARAM]: "",
      [SORT_PARAM]: "",
      [TAB_PARAM]: "",
    });
  };

  const handleTabChange = (nextTab: TabValue) => {
    setPreviewApplicationId(null);
    updateParams({
      [TAB_PARAM]: nextTab === "all" ? "" : nextTab,
    });
  };

  const handleSelectApplication = (application: ApplicationListItem) => {
    setShouldRenderPreviewSheet(true);
    setPreviewApplicationId(application.id);
  };

  const handleClosePreview = () => {
    setPreviewApplicationId(null);
  };

  const handleStatusChange = (applicationId: string, nextStatus: JobStatus) => {
    setApplications((currentApplications) =>
      currentApplications.map((item) =>
        item.id === applicationId ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  async function loadNextPage() {
    if (isFetchingNextPageRef.current || !hasNextPage) {
      return;
    }

    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);
    setPaginationErrorMessage(null);

    try {
      const dateRange = getPeriodDateRange(period);
      const result = await getApplications({
        limit: PAGE_SIZE,
        offset: applications.length,
        periodEnd: dateRange?.end,
        periodStart: dateRange?.start,
        search: search || undefined,
        sort,
      });

      if (!result.ok) {
        setPaginationErrorMessage(result.reason);
        return;
      }

      setApplications((currentApplications) => [
        ...currentApplications,
        ...result.data.items,
      ]);
      setHasNextPage(result.data.hasMore);
    } finally {
      setIsFetchingNextPage(false);
      isFetchingNextPageRef.current = false;
    }
  }

  const handleNearEnd = () => {
    void loadNextPage();
  };

  return (
    <div className="flex flex-col gap-6">
      <ApplicationsPageHeader
        applications={applications}
        dateLabel={dateLabel}
        hasNextPage={hasNextPage ?? false}
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
          onNearEndAction={handleNearEnd}
          onRangeChangeAction={(startIndex: number) =>
            setIsListScrolled(startIndex > 0)
          }
          onSelectApplicationAction={handleSelectApplication}
          onTabChangeAction={handleTabChange}
          ref={tabsRef}
          tab={tab}
        />
        {paginationErrorMessage && (
          <div className="border-t border-border/70 bg-background px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                다음 항목을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시
                시도해 주세요.
              </p>
              <Button
                className="shrink-0 rounded-full font-semibold hover:border-primary/30 hover:text-primary"
                onClick={() => {
                  void loadNextPage();
                }}
                variant="outline"
              >
                다시 시도
              </Button>
            </div>
          </div>
        )}
      </section>

      {(shouldRenderPreviewSheet || isPreviewOpen) && (
        <ApplicationPreviewSheet
          application={selectedApplication}
          isOpen={isPreviewOpen}
          onCloseAction={handleClosePreview}
          onStatusChangeAction={handleStatusChange}
        />
      )}
      <GoToTopFAB
        className="md:bottom-24"
        isVisible={isListScrolled}
        onScrollToTop={() => tabsRef.current?.scrollToTop()}
      />
    </div>
  );
}
