"use client";

import { useMutation } from "@tanstack/react-query";
import { FileTextIcon, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
  UpdateJobDescriptionInput,
  UpdateJobDescriptionResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui";

import { DetailSectionHeader } from "./DetailSectionHeader";

type JobDescriptionEditorProps = {
  applicationId: string;
  description: null | string;
  updateDescriptionAction: (
    input: UpdateJobDescriptionInput,
  ) => Promise<UpdateJobDescriptionResult>;
};

export function JobDescriptionEditor({
  applicationId,
  description,
  updateDescriptionAction,
}: JobDescriptionEditorProps) {
  const router = useRouter();
  const [currentDescription, setCurrentDescription] = useState(description);
  const [draftText, setDraftText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // prop이 바뀌면 렌더 중에 바로 동기화 — effect 없이 이전 값 추적으로 처리
  const [syncedProps, setSyncedProps] = useState({
    applicationId,
    description,
  });
  if (
    syncedProps.applicationId !== applicationId ||
    syncedProps.description !== description
  ) {
    setSyncedProps({ applicationId, description });
    setCurrentDescription(description);
    setErrorMessage(null);
  }

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const mutation = useMutation<
    { description: null | string },
    Error,
    null | string,
    { previousDescription: null | string }
  >({
    mutationFn: async (nextDescription) => {
      const result = await updateDescriptionAction({
        applicationId,
        description: nextDescription,
      });
      if (!result.ok) {
        throw new Error(result.reason);
      }
      return result.data;
    },
    onError: (error, variables, context) => {
      if (context) {
        setCurrentDescription(context.previousDescription);
      }
      setDraftText(variables ?? "");
      setIsEditing(true);
      setErrorMessage(error.message);
    },
    onMutate: (nextDescription) => {
      const previousDescription = currentDescription;
      setCurrentDescription(nextDescription);
      setErrorMessage(null);
      setIsEditing(false);
      return { previousDescription };
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  function handleEditStart() {
    setDraftText(currentDescription ?? "");
    setErrorMessage(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setErrorMessage(null);
    setIsEditing(false);
    editButtonRef.current?.focus();
  }

  function handleSave() {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate(draftText.trim() === "" ? null : draftText);
  }

  return (
    <div className="space-y-4">
      <DetailSectionHeader
        action={
          !isEditing ? (
            <Button
              aria-label="편집"
              className="size-9 rounded-full"
              disabled={mutation.isPending}
              onClick={handleEditStart}
              ref={editButtonRef}
              title="편집"
              variant="ghost"
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Button>
          ) : null
        }
        description="원문 공고 내용을 저장해 두고 이후에도 같은 기준으로 비교합니다."
        headingId={`job-description-label-${applicationId}`}
        icon={<FileTextIcon aria-hidden="true" className="size-5" />}
        title="공고 설명"
      />

      <div aria-atomic="true" aria-live="polite" className="min-h-0">
        {isEditing && errorMessage && (
          <p className="mb-2 text-sm font-medium text-destructive">
            {errorMessage}
          </p>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            aria-labelledby={`job-description-label-${applicationId}`}
            className="min-h-56 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutation.isPending}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="공고 설명을 입력하세요"
            ref={textareaRef}
            value={draftText}
          />
          <div className="flex justify-end gap-2">
            <Button
              className="h-9 rounded-full px-4 text-sm font-medium"
              disabled={mutation.isPending}
              onClick={handleCancel}
              variant="ghost"
            >
              취소
            </Button>
            <Button
              className="h-9 rounded-full px-5 text-sm font-semibold"
              disabled={mutation.isPending}
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-56 rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 sm:px-5">
          <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-foreground/90">
            {currentDescription ?? (
              <span className="text-muted-foreground">
                공고 설명이 없습니다
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
