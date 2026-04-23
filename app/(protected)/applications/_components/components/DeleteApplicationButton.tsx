"use client";

import type { Route } from "next";

import { useMutation } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  DeleteApplicationInput,
  DeleteApplicationResult,
} from "@/lib/types/application";

import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Button, type ButtonProps } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

type DeleteApplicationAction = (
  input: DeleteApplicationInput,
) => Promise<DeleteApplicationResult>;

type DeleteApplicationButtonProps = {
  applicationId: string;
  buttonClassName?: string;
  buttonSize?: ButtonProps["size"];
  buttonVariant?: ButtonProps["variant"];
  companyName: string;
  deleteAction: DeleteApplicationAction;
  onDeleteSuccessAction?: () => void;
  positionTitle: string;
  redirectHref?: Route;
};

export function DeleteApplicationButton({
  applicationId,
  buttonClassName,
  buttonSize = "sm",
  buttonVariant = "ghost",
  companyName,
  deleteAction,
  onDeleteSuccessAction,
  positionTitle,
  redirectHref,
}: DeleteApplicationButtonProps) {
  const router = useRouter();
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
      if (onDeleteSuccessAction) {
        onDeleteSuccessAction();
        return;
      }

      if (redirectHref) {
        router.replace(redirectHref);
        return;
      }

      router.refresh();
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
      <Button
        aria-label="지원 삭제"
        className={cn(buttonClassName)}
        onClick={handleOpen}
        size={buttonSize}
        title="지원 삭제"
        variant={buttonVariant}
      >
        <Trash2Icon aria-hidden="true" className="size-4" />
      </Button>

      <AlertDialog isOpen={isOpen} onClose={handleClose}>
        <AlertDialog.Overlay
          onClick={(event) => {
            if (mutation.isPending) {
              event.preventDefault();
            }
          }}
        />
        <AlertDialog.Content>
          <AlertDialog.Title className="mb-2">지원 삭제</AlertDialog.Title>
          <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[15px] font-medium text-muted-foreground">
            <span className="font-medium text-foreground">{companyName}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            <span className="font-medium text-foreground">{positionTitle}</span>
          </p>
          <AlertDialog.Description className="mb-6 text-[15px] leading-6 font-medium">
            이 지원 기록과 면접 일정이 모두 삭제됩니다. 이 작업은 되돌릴 수
            없습니다.
          </AlertDialog.Description>

          {errorMessage !== null ? (
            <p
              className="mb-4 text-sm font-medium text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

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
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}
