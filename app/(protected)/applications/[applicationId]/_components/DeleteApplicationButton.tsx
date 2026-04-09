"use client";

import { useMutation } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import type {
  DeleteApplicationInput,
  DeleteApplicationResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui";
import { BottomSheet } from "@/components/ui/bottom-sheet/BottomSheet";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

type DeleteApplicationAction = (
  input: DeleteApplicationInput,
) => Promise<DeleteApplicationResult>;

type DeleteApplicationButtonProps = {
  applicationId: string;
  companyName: string;
  deleteAction: DeleteApplicationAction;
  positionTitle: string;
};

export function DeleteApplicationButton({
  applicationId,
  companyName,
  deleteAction,
  positionTitle,
}: DeleteApplicationButtonProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await deleteAction({ applicationId });
      if (!result.ok) {
        throw new Error(result.reason);
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
    onMutate: () => {
      setErrorMessage(null);
    },
    onSuccess: () => {
      posthog.capture(POSTHOG_EVENTS.APPLICATION_DELETED);
      router.push("/dashboard");
    },
  });

  function handleOpen() {
    setErrorMessage(null);
    setIsOpen(true);
  }

  function handleClose() {
    if (mutation.isPending) {
      return;
    }
    setIsOpen(false);
  }

  function handleConfirm() {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  }

  return (
    <>
      <Tooltip label="지원 삭제" side="bottom">
        <Button
          aria-label="지원 삭제"
          onClick={handleOpen}
          size="sm"
          variant="ghost"
        >
          <Trash2Icon aria-hidden="true" className="size-4" />
        </Button>
      </Tooltip>

      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <BottomSheet.Overlay
          onClick={(e) => {
            if (mutation.isPending) {
              e.preventDefault();
            }
          }}
        />
        <BottomSheet.Content className="min-h-0">
          <BottomSheet.Header />
          <BottomSheet.Body>
            <BottomSheet.Title className="mb-2">지원 삭제</BottomSheet.Title>
            <p className="mb-1 text-[15px] text-muted-foreground">
              <span className="font-medium text-foreground">{companyName}</span>{" "}
              ·{" "}
              <span className="font-medium text-foreground">
                {positionTitle}
              </span>
            </p>
            <p className="mb-6 text-[15px] text-muted-foreground">
              이 지원 기록과 면접 일정이 모두 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </p>

            {errorMessage !== null && (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                disabled={mutation.isPending}
                onClick={handleClose}
                type="button"
                variant="outline"
              >
                취소
              </Button>
              <Button
                disabled={mutation.isPending}
                onClick={handleConfirm}
                type="button"
                variant="destructive"
              >
                {mutation.isPending ? "삭제하는 중..." : "삭제"}
              </Button>
            </div>
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}
