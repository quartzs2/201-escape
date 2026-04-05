"use client";

import type { InfiniteData } from "@tanstack/react-query";
import type { Route } from "next";

import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import type { GetApplicationsPage } from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { getApplications } from "@/lib/actions";

import type { ApplicationListItem } from "../types";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { GoToTopFAB } from "../../go-to-top";
import {
  APPLICATIONS_QUERY_KEY,
  getApplicationsNextPageParam,
  PAGE_SIZE,
} from "../constants";
import { ApplicationPreviewSheet } from "./ApplicationPreviewSheet";
import { ApplicationTabs } from "./ApplicationTabs";

const PREVIEW_PARAM = "preview";

export function DashboardApplicationsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const [isListScrolled, setIsListScrolled] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      getNextPageParam: getApplicationsNextPageParam,
      initialPageParam: 0,
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const result = await getApplications({
          limit: PAGE_SIZE,
          offset: pageParam,
        });
        if (!result.ok) {
          throw new Error(result.reason);
        }
        return result.data;
      },
      queryKey: APPLICATIONS_QUERY_KEY,
    });

  const applications: ApplicationListItem[] = data.pages.flatMap(
    (page) => page.items,
  );

  const selectedApplicationId = searchParams.get(PREVIEW_PARAM);
  const isPreviewOpen = selectedApplicationId !== null;

  const selectedApplication =
    applications.find((a) => a.id === selectedApplicationId) ?? null;

  const handleSelectApplication = (application: ApplicationListItem) => {
    router.replace(
      `${pathname}?${PREVIEW_PARAM}=${application.id}` as unknown as Route,
    );
  };

  const handleClosePreview = () => {
    router.replace(pathname as unknown as Route);
  };

  const handleStatusChange = (applicationId: string, nextStatus: JobStatus) => {
    queryClient.setQueryData<InfiniteData<GetApplicationsPage>>(
      APPLICATIONS_QUERY_KEY,
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
    <div className="flex h-full flex-col">
      <ApplicationTabs
        applications={applications}
        className="min-h-0 flex-1"
        isFetchingNextPage={isFetchingNextPage}
        onNearEnd={handleNearEnd}
        onRangeChange={(startIndex) => setIsListScrolled(startIndex > 0)}
        onSelectApplication={handleSelectApplication}
        ref={tabsRef}
      />
      <ApplicationPreviewSheet
        application={selectedApplication}
        isOpen={isPreviewOpen}
        onCloseAction={handleClosePreview}
        onStatusChangeAction={handleStatusChange}
      />
      <GoToTopFAB
        isVisible={isListScrolled}
        onScrollToTop={() => tabsRef.current?.scrollToTop()}
      />
    </div>
  );
}
