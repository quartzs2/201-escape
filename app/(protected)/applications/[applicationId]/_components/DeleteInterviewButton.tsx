"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  DeleteInterviewInput,
  DeleteInterviewResult,
} from "@/lib/types/interview";

import { Button } from "@/components/ui";
import { BottomSheet } from "@/components/ui/bottom-sheet/BottomSheet";

type DeleteInterviewAction = (
  input: DeleteInterviewInput,
) => Promise<DeleteInterviewResult>;

type DeleteInterviewButtonProps = {
  applicationId: string;
  deleteAction: DeleteInterviewAction;
  interviewId: string;
  round: number;
};

export function DeleteInterviewButton({
  applicationId,
  deleteAction,
  interviewId,
  round,
}: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  function handleOpen() {
    setErrorMessage(null);
    setIsOpen(true);
  }

  function handleClose() {
    if (isDeleting) {
      return;
    }
    setIsOpen(false);
  }

  async function handleConfirm() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteAction({ applicationId, interviewId });

      if (!result.ok) {
        setErrorMessage(result.reason);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button onClick={handleOpen} size="sm" variant="ghost">
        삭제
      </Button>

      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <BottomSheet.Overlay
          onClick={(e) => {
            if (isDeleting) {
              e.preventDefault();
            }
          }}
        />
        <BottomSheet.Content className="min-h-0">
          <BottomSheet.Header />
          <BottomSheet.Body>
            <BottomSheet.Title className="mb-2">
              면접 일정 삭제
            </BottomSheet.Title>
            <p className="mb-6 text-[15px] font-medium text-muted-foreground">
              {round}차 면접 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </p>

            {errorMessage !== null && (
              <p className="mb-4 text-sm font-medium text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                disabled={isDeleting}
                onClick={handleClose}
                type="button"
                variant="outline"
              >
                취소
              </Button>
              <Button
                disabled={isDeleting}
                onClick={handleConfirm}
                type="button"
                variant="destructive"
              >
                {isDeleting ? "삭제하는 중..." : "삭제"}
              </Button>
            </div>
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}
