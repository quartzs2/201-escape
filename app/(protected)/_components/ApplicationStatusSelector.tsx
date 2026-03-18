"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type {
  UpdateApplicationStatusInput,
  UpdateApplicationStatusResult,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { TabSelector } from "@/components/ui";
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
} from "@/lib/constants/application-status";
import { cn } from "@/lib/utils";

export type ApplicationStatusSelectorProps = {
  applicationId: string;
  ariaLabel: string;
  className?: string;
  icon?: ReactNode;
  label?: string;
  onStatusChangeAction?: (nextStatus: JobStatus) => void;
  status: JobStatus;
  updateStatusAction: UpdateStatusAction;
};

type UpdateStatusAction = (
  input: UpdateApplicationStatusInput,
) => Promise<UpdateApplicationStatusResult>;

const STATUS_ITEMS = APPLICATION_STATUS_ORDER.map((status) => ({
  label: APPLICATION_STATUS_META[status].label,
  value: status,
}));

export function ApplicationStatusSelector({
  applicationId,
  ariaLabel,
  className,
  icon,
  label,
  onStatusChangeAction,
  status,
  updateStatusAction,
}: ApplicationStatusSelectorProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setErrorMessage(null);
  }, [applicationId, status]);

  async function handleValueChange(nextStatus: string) {
    if (isSaving || nextStatus === currentStatus) {
      return;
    }

    if (!APPLICATION_STATUS_ORDER.includes(nextStatus as JobStatus)) {
      return;
    }

    const parsedStatus = nextStatus as JobStatus;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await updateStatusAction({
        applicationId,
        status: parsedStatus,
      });

      if (!result.ok) {
        setErrorMessage(result.reason);
        return;
      }

      setCurrentStatus(parsedStatus);
      onStatusChangeAction?.(parsedStatus);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(icon ?? label) && (
        <div className="flex items-center gap-2 text-foreground">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {label && <h3 className="text-sm font-semibold">{label}</h3>}
          <div aria-live="polite" className="min-h-5">
            {isSaving && (
              <p className="text-sm text-muted-foreground">저장하는 중...</p>
            )}
            {!isSaving && errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
      <TabSelector
        activeItemClassName="border-foreground bg-foreground text-background"
        aria-label={ariaLabel}
        disabled={isSaving}
        inactiveItemClassName="border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
        itemClassName="min-h-11 flex-none rounded-full border px-4 py-2 font-medium shadow-none"
        items={STATUS_ITEMS}
        listClassName="flex flex-wrap gap-2 rounded-none border-0 bg-transparent p-0"
        onValueChange={handleValueChange}
        value={currentStatus}
      />
    </div>
  );
}
