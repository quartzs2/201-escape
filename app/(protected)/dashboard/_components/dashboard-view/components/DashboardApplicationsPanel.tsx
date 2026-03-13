"use client";

import { useState } from "react";

import type { ApplicationListItem } from "../types";

import { ApplicationPreviewSheet } from "./ApplicationPreviewSheet";
import { ApplicationTabs } from "./ApplicationTabs";

type DashboardApplicationsPanelProps = {
  applications: ApplicationListItem[];
};

export function DashboardApplicationsPanel({
  applications,
}: DashboardApplicationsPanelProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationListItem | null>(null);

  const handleSelectApplication = (application: ApplicationListItem) => {
    setSelectedApplication(application);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <ApplicationTabs
        applications={applications}
        onSelectApplication={handleSelectApplication}
      />
      <ApplicationPreviewSheet
        application={selectedApplication}
        isOpen={isPreviewOpen}
        onCloseAction={handleClosePreview}
      />
    </>
  );
}
