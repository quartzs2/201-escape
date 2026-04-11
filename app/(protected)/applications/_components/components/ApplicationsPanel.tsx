"use client";

import type { InfiniteData } from "@tanstack/react-query";
import type { Route } from "next";

import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import type { GetApplicationsPage } from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { getApplications } from "@/lib/actions";

import type { PeriodPreset, SortValue, TabValue } from "../constants";
import type { ApplicationListItem } from "../types";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { ApplicationsPageHeader } from "../ApplicationsPageHeader";
import {
  buildApplicationsQueryKey,
  getApplicationsNextPageParam,
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
import { ApplicationPreviewSheet } from "./ApplicationPreviewSheet";
import { ApplicationTabs } from "./ApplicationTabs";

type ApplicationsPanelProps = {
  dateLabel: string;
};

export function ApplicationsPanel({ dateLabel }: ApplicationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const [isListScrolled, setIsListScrolled] = useState(false);

  const search = searchParams.get(SEARCH_PARAM) ?? "";
  const period = parsePeriodParam(searchParams.get(PERIOD_PARAM));
  const sort = parseSortParam(searchParams.get(SORT_PARAM));
  const tab = parseTabParam(searchParams.get(TAB_PARAM));

  const queryKey = buildApplicationsQueryKey({ period, search, sort });
  const dateRange = useMemo(() => getPeriodDateRange(period), [period]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      getNextPageParam: getApplicationsNextPageParam,
      initialPageParam: 0,
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const result = await getApplications({
          limit: PAGE_SIZE,
          offset: pageParam,
          periodEnd: dateRange?.end,
          periodStart: dateRange?.start,
          search: search || undefined,
          sort,
        });
        if (!result.ok) {
          throw new Error(result.reason);
        }
        return result.data;
      },
      queryKey,
    });

  const applications: ApplicationListItem[] = data.pages.flatMap(
    (page) => page.items,
  );

  const selectedApplicationId = searchParams.get(PREVIEW_PARAM);
  const isPreviewOpen = selectedApplicationId !== null;
  const selectedApplication =
    applications.find((a) => a.id === selectedApplicationId) ?? null;

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
    );
  };

  const handleSearchSubmit = (nextSearch: string) => {
    updateParams({ [PREVIEW_PARAM]: "", [SEARCH_PARAM]: nextSearch });
  };

  const handlePeriodChange = (nextPeriod: PeriodPreset) => {
    updateParams({
      [PERIOD_PARAM]: nextPeriod === "all" ? "" : nextPeriod,
      [PREVIEW_PARAM]: "",
    });
  };

  const handleSortChange = (nextSort: SortValue) => {
    updateParams({
      [PREVIEW_PARAM]: "",
      [SORT_PARAM]: nextSort === "applied_at_desc" ? "" : nextSort,
    });
  };

  const handleResetFilters = () => {
    updateParams({
      [PERIOD_PARAM]: "",
      [PREVIEW_PARAM]: "",
      [SEARCH_PARAM]: "",
      [SORT_PARAM]: "",
      [TAB_PARAM]: "",
    });
  };

  const handleTabChange = (nextTab: TabValue) => {
    updateParams({
      [PREVIEW_PARAM]: "",
      [TAB_PARAM]: nextTab === "all" ? "" : nextTab,
    });
  };

  const handleSelectApplication = (application: ApplicationListItem) => {
    updateParams({ [PREVIEW_PARAM]: application.id });
  };

  const handleClosePreview = () => {
    updateParams({ [PREVIEW_PARAM]: "" });
  };

  const handleStatusChange = (applicationId: string, nextStatus: JobStatus) => {
    queryClient.setQueryData<InfiniteData<GetApplicationsPage>>(
      queryKey,
      (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === applicationId
                ? { ...item, status: nextStatus }
                : item,
            ),
          })),
        };
      },
    );
  };

  const handleNearEnd = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
      </section>

      <ApplicationPreviewSheet
        application={selectedApplication}
        isOpen={isPreviewOpen}
        onCloseAction={handleClosePreview}
        onStatusChangeAction={handleStatusChange}
      />
      <GoToTopFAB
        className="md:bottom-24"
        isVisible={isListScrolled}
        onScrollToTop={() => tabsRef.current?.scrollToTop()}
      />
    </div>
  );
}
