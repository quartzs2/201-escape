"use client";

import type { Route } from "next";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { JobStatus } from "@/lib/types/job";

import type { ApplicationListItem } from "../types";

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

  const [applicationItems, setApplicationItems] = useState(applications);

  useEffect(() => {
    setApplicationItems(applications);
  }, [applications]);

  const selectedApplicationId = searchParams.get(PREVIEW_PARAM);
  const isPreviewOpen = selectedApplicationId !== null;

  const handleSelectApplication = (application: ApplicationListItem) => {
    router.push(
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
    <>
      <ApplicationTabs
        applications={applicationItems}
        onSelectApplication={handleSelectApplication}
      />
      <ApplicationPreviewSheet
        application={selectedApplication}
        isOpen={isPreviewOpen}
        onCloseAction={handleClosePreview}
        onStatusChangeAction={handleStatusChange}
      />
    </>
  );
}
