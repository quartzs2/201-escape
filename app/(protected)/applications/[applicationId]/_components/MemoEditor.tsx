"use client";

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
        {isEditing && isSaving && (
          <p className="mb-2 text-xs text-muted-foreground">저장하는 중...</p>
        )}
        {isEditing && !isSaving && errorMessage && (
          <p className="mb-2 text-xs font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            aria-labelledby={`memo-label-${applicationId}`}
            className="min-h-[120px] w-full resize-none rounded-xl border border-input bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="메모를 입력하세요"
            ref={textareaRef}
            value={draftText}
          />
          <div className="flex justify-end gap-2">
            <Button
              className="h-9 rounded-full px-4 text-sm font-medium"
              disabled={isSaving}
              onClick={handleCancel}
              variant="ghost"
            >
              취소
            </Button>
            <Button
              className="h-9 rounded-full px-5 text-sm font-semibold"
              disabled={isSaving}
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/30 p-4">
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-foreground/90">
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
