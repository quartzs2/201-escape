"use client";

import { useMutation } from "@tanstack/react-query";
import { NotebookPenIcon, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useRef, useState } from "react";

import type {
  UpdateApplicationNotesInput,
  UpdateApplicationNotesResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

import { DetailSectionHeader } from "./DetailSectionHeader";

type MemoEditorProps = {
  applicationId: string;
  notes: null | string;
  updateNotesAction: (
    input: UpdateApplicationNotesInput,
  ) => Promise<UpdateApplicationNotesResult>;
};

export function MemoEditor({
  applicationId,
  notes,
  updateNotesAction,
}: MemoEditorProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [draftText, setDraftText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // prop이 바뀌면 렌더 중에 바로 동기화 — effect 없이 이전 값 추적으로 처리
  const [syncedProps, setSyncedProps] = useState({ applicationId, notes });
  if (
    syncedProps.applicationId !== applicationId ||
    syncedProps.notes !== notes
  ) {
    setSyncedProps({ applicationId, notes });
    setCurrentNotes(notes);
    setErrorMessage(null);
  }

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const mutation = useMutation<
    { notes: null | string },
    Error,
    null | string,
    { previousNotes: null | string }
  >({
    mutationFn: async (nextNotes) => {
      const result = await updateNotesAction({
        applicationId,
        notes: nextNotes,
      });
      if (!result.ok) {
        throw new Error(result.reason);
      }
      return result.data;
    },
    onError: (error, variables, context) => {
      if (context) {
        setCurrentNotes(context.previousNotes);
      }
      setDraftText(variables ?? "");
      setIsEditing(true);
      setErrorMessage(error.message);
    },
    onMutate: (nextNotes) => {
      const previousNotes = currentNotes;
      setCurrentNotes(nextNotes);
      setErrorMessage(null);
      setIsEditing(false);
      return { previousNotes };
    },
    onSuccess: () => {
      posthog.capture(POSTHOG_EVENTS.MEMO_SAVED);
      router.refresh();
    },
  });

  function handleEditStart() {
    setDraftText(currentNotes ?? "");
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
            <Tooltip label="편집" side="bottom">
              <Button
                aria-label="편집"
                className="size-9 rounded-full"
                disabled={mutation.isPending}
                onClick={handleEditStart}
                ref={editButtonRef}
                variant="ghost"
              >
                <PencilIcon aria-hidden="true" className="size-4" />
              </Button>
            </Tooltip>
          ) : null
        }
        description="다음 액션, 인상, 비교 포인트를 남겨 두는 작업 공간입니다."
        headingId={`memo-label-${applicationId}`}
        icon={<NotebookPenIcon aria-hidden="true" className="size-5" />}
        title="개인 메모"
      />

      <div aria-atomic="true" aria-live="polite" className="min-h-0">
        {isEditing && errorMessage && (
          <p className="mb-2 text-xs font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            aria-labelledby={`memo-label-${applicationId}`}
            className="min-h-40 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={mutation.isPending}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="메모를 입력하세요"
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
        <div className="min-h-40 rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 sm:px-5">
          <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-foreground/90">
            {currentNotes ?? (
              <span className="text-muted-foreground">메모가 없습니다</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
