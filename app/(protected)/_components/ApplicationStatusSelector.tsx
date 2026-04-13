"use client";

import type { ReactNode } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  // status prop 기준으로 에러를 추적 — prop이 바뀌면 이전 에러는 무효
  const [errorState, setErrorState] = useState<null | {
    message: string;
    status: JobStatus;
  }>(null);

  const errorMessage =
    errorState?.status === status ? errorState.message : null;

  const mutation = useMutation<
    void,
    Error,
    JobStatus,
    { previousStatus: JobStatus }
  >({
    mutationFn: async (nextStatus) => {
      const result = await updateStatusAction({
        applicationId,
        status: nextStatus,
      });
      if (!result.ok) {
        throw new Error(result.reason);
      }
    },
    onError: (error, _, context) => {
      if (context) {
        setCurrentStatus(context.previousStatus);
        onStatusChangeAction?.(context.previousStatus);
      }
      setErrorState({ message: error.message, status });
    },
    onMutate: (nextStatus) => {
      const previousStatus = currentStatus;
      setCurrentStatus(nextStatus);
      setErrorState(null);
      onStatusChangeAction?.(nextStatus);
      return { previousStatus };
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  function handleValueChange(nextStatus: string) {
    if (mutation.isPending || nextStatus === currentStatus) {
      return;
    }

    if (!APPLICATION_STATUS_ORDER.includes(nextStatus as JobStatus)) {
      return;
    }

    mutation.mutate(nextStatus as JobStatus);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(icon ?? label) && (
        <div className="flex items-center gap-2 text-foreground">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {label && <h3 className="text-sm font-semibold">{label}</h3>}
          <div aria-live="polite" className="min-h-5">
            {mutation.isPending && (
              <p className="text-sm text-muted-foreground">저장하는 중...</p>
            )}
            {!mutation.isPending && errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
      <TabSelector
        activeItemClassName="border-primary bg-primary text-primary-foreground shadow-md"
        aria-label={ariaLabel}
        disabled={mutation.isPending}
        inactiveItemClassName="border-border/50 bg-background text-muted-foreground hover:border-primary/20 hover:text-primary/70"
        itemClassName="min-h-11 flex-none rounded-full border px-4 py-2 font-bold shadow-none"
        items={STATUS_ITEMS}
        listClassName="flex flex-wrap gap-2 rounded-none border-0 bg-transparent p-0"
        onValueChange={handleValueChange}
        value={currentStatus}
      />
    </div>
  );
}
