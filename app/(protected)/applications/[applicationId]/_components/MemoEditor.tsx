"use client";

import { useMutation } from "@tanstack/react-query";
import { NotebookPenIcon, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
  UpdateApplicationNotesInput,
  UpdateApplicationNotesResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-muted-foreground">
            <NotebookPenIcon aria-hidden="true" className="size-5" />
          </span>
          <h2
            className="text-sm font-bold tracking-tight uppercase"
            id={`memo-label-${applicationId}`}
          >
            개인 메모
          </h2>
        </div>
        {!isEditing && (
          <Tooltip label="편집" side="bottom">
            <Button
              aria-label="편집"
              className="size-8 rounded-full"
              disabled={mutation.isPending}
              onClick={handleEditStart}
              ref={editButtonRef}
              variant="ghost"
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Button>
          </Tooltip>
        )}
      </div>

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
            className="min-h-30 w-full resize-none rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-xl bg-muted/30 p-4">
          <p className="text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap text-foreground/90">
            {currentNotes ?? (
              <span className="text-muted-foreground/60 italic">
                메모가 없습니다
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
