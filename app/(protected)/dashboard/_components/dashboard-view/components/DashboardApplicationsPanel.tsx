"use client";

import type { Route } from "next";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { JobStatus } from "@/lib/types/job";

import type { ApplicationListItem } from "../types";
import type { ApplicationTabsHandle } from "./ApplicationTabs";

import { GoToTopFAB } from "../../go-to-top";
import { ApplicationPreviewSheet } from "./ApplicationPreviewSheet";
import { ApplicationTabs } from "./ApplicationTabs";

const PREVIEW_PARAM = "preview";

type DashboardApplicationsPanelProps = {
  applications: ApplicationListItem[];
};

export function DashboardApplicationsPanel({
  applications,
}: DashboardApplicationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabsRef = useRef<ApplicationTabsHandle>(null);
  const [isListScrolled, setIsListScrolled] = useState(false);
  const [applicationItems, setApplicationItems] = useState(applications);

  useEffect(() => {
    setApplicationItems(applications);
  }, [applications]);

  const selectedApplicationId = searchParams.get(PREVIEW_PARAM);
  const isPreviewOpen = selectedApplicationId !== null;

  const handleSelectApplication = (application: ApplicationListItem) => {
    router.replace(
      `${pathname}?${PREVIEW_PARAM}=${application.id}` as unknown as Route,
    );
  };

  const handleClosePreview = () => {
    router.replace(pathname as unknown as Route);
  };

  const handleStatusChange = (applicationId: string, nextStatus: JobStatus) => {
    setApplicationItems((currentApplications) =>
      currentApplications.map((application) => {
        if (application.id !== applicationId) {
          return application;
        }

        return {
          ...application,
          status: nextStatus,
        };
      }),
    );
  };

  const selectedApplication =
    applicationItems.find(
      (application) => application.id === selectedApplicationId,
    ) ?? null;

  return (
    <div className="h-full">
      <ApplicationTabs
        applications={applicationItems}
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
