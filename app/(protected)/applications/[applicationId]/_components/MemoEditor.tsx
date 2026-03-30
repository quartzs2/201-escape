"use client";

import { NotebookPenIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type {
  UpdateApplicationNotesInput,
  UpdateApplicationNotesResult,
} from "@/lib/types/application";

import { Button } from "@/components/ui";

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
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentNotes(notes);
    setErrorMessage(null);
  }, [applicationId, notes]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  function handleEditStart() {
    setDraftText(currentNotes ?? "");
    setErrorMessage(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    editButtonRef.current?.focus();
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await updateNotesAction({
        applicationId,
        notes: draftText.trim() === "" ? null : draftText,
      });

      if (!result.ok) {
        setErrorMessage(result.reason);
        return;
      }

      setCurrentNotes(result.data.notes);
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-muted-foreground">
          <NotebookPenIcon aria-hidden="true" className="size-5" />
        </span>
        <h2
          className="text-base font-semibold tracking-[-0.01em]"
          id={`memo-label-${applicationId}`}
        >
          개인 메모
        </h2>
        <div className="ml-auto flex items-center">
          {!isEditing && (
            <Button
              onClick={handleEditStart}
              ref={editButtonRef}
              size="sm"
              variant="ghost"
            >
              편집
            </Button>
          )}
          <div aria-atomic="true" aria-live="polite" className="min-h-5">
            {isEditing && isSaving && (
              <p className="text-sm text-muted-foreground">저장하는 중...</p>
            )}
            {isEditing && !isSaving && errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <>
          <textarea
            aria-labelledby={`memo-label-${applicationId}`}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base leading-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="메모를 입력하세요"
            ref={textareaRef}
            rows={5}
            value={draftText}
          />
          <div className="flex justify-end gap-2">
            <Button
              disabled={isSaving}
              onClick={handleCancel}
              size="sm"
              variant="outline"
            >
              취소
            </Button>
            <Button disabled={isSaving} onClick={handleSave} size="sm">
              저장
            </Button>
          </div>
        </>
      ) : (
        <p className="text-[15px] leading-8 wrap-break-word whitespace-pre-wrap text-foreground">
          {currentNotes ?? "메모가 없습니다"}
        </p>
      )}
    </section>
  );
}
