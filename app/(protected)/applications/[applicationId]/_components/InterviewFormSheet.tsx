"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  InterviewDetail,
  InterviewType,
  UpsertInterviewInput,
  UpsertInterviewResult,
} from "@/lib/types/interview";

import { Button } from "@/components/ui";
import { BottomSheet } from "@/components/ui/bottom-sheet/BottomSheet";
import { INTERVIEW_TYPE_LABEL } from "@/lib/constants/interview-type";
import { Constants } from "@/lib/types/supabase";
import { toDatetimeLocalValue } from "@/lib/utils";

const INTERVIEW_TYPES = Constants.public.Enums.interview_type;

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export type InterviewFormSheetProps = AddModeProps | EditModeProps;

type AddModeProps = {
  applicationId: string;
  defaultRound?: number;
  mode: "add";
  upsertAction: UpsertAction;
};

type EditModeProps = {
  applicationId: string;
  interview: InterviewDetail;
  mode: "edit";
  upsertAction: UpsertAction;
};

type FormValues = {
  interviewType: InterviewType;
  location: string;
  round: number;
  scheduledAt: string;
  scratchpad: string;
};

type UpsertAction = (
  input: UpsertInterviewInput,
) => Promise<UpsertInterviewResult>;

export function InterviewFormSheet(props: InterviewFormSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(() =>
    getInitialValues(props),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const isEditMode = props.mode === "edit";
  const title = isEditMode ? "면접 일정 편집" : "면접 일정 추가";
  const triggerLabel = isEditMode ? "편집" : "추가";

  function handleOpen() {
    setValues(getInitialValues(props));
    setErrorMessage(null);
    setIsOpen(true);
  }

  function handleClose() {
    if (isSaving) {
      return;
    }
    setIsOpen(false);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) {
      return;
    }

    if (!values.scheduledAt) {
      setErrorMessage("면접 일시를 입력해 주세요.");
      return;
    }

    const scheduledAtDate = new Date(values.scheduledAt);
    if (isNaN(scheduledAtDate.getTime())) {
      setErrorMessage("올바른 면접 일시를 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await props.upsertAction({
        applicationId: props.applicationId,
        interviewType: values.interviewType,
        location: values.location,
        round: values.round,
        scheduledAt: scheduledAtDate.toISOString(),
        scratchpad: values.scratchpad,
      });

      if (!result.ok) {
        setErrorMessage(result.reason);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button onClick={handleOpen} size="sm" variant="ghost">
        {triggerLabel}
      </Button>

      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <BottomSheet.Overlay
          onClick={(e) => {
            if (isSaving) {
              e.preventDefault();
            }
          }}
        />
        <BottomSheet.Content>
          <BottomSheet.Header />
          <BottomSheet.Body>
            <BottomSheet.Title className="mb-6">{title}</BottomSheet.Title>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="interview-round"
                >
                  차수
                </label>
                <input
                  className={INPUT_CLASS}
                  disabled={isEditMode || isSaving}
                  id="interview-round"
                  min={1}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      round: Number(e.target.value),
                    }))
                  }
                  required
                  type="number"
                  value={values.round}
                />
                {isEditMode && (
                  <p className="text-xs text-muted-foreground">
                    차수는 변경할 수 없습니다.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="interview-type"
                >
                  면접 유형
                </label>
                <select
                  className={INPUT_CLASS}
                  disabled={isSaving}
                  id="interview-type"
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      interviewType: e.target.value as InterviewType,
                    }))
                  }
                  value={values.interviewType}
                >
                  {INTERVIEW_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {INTERVIEW_TYPE_LABEL[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="interview-scheduled-at"
                >
                  일시
                </label>
                <input
                  className={INPUT_CLASS}
                  disabled={isSaving}
                  id="interview-scheduled-at"
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      scheduledAt: e.target.value,
                    }))
                  }
                  required
                  type="datetime-local"
                  value={values.scheduledAt}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="flex gap-1 text-sm font-medium text-foreground"
                  htmlFor="interview-location"
                >
                  <span>장소</span>
                  <span className="font-normal text-muted-foreground">
                    (선택)
                  </span>
                </label>
                <input
                  className={INPUT_CLASS}
                  disabled={isSaving}
                  id="interview-location"
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="예) 강남역 본사 3층"
                  type="text"
                  value={values.location}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="flex gap-1 text-sm font-medium text-foreground"
                  htmlFor="interview-scratchpad"
                >
                  <span>메모</span>
                  <span className="font-normal text-muted-foreground">
                    (선택)
                  </span>
                </label>
                <textarea
                  className={INPUT_CLASS}
                  disabled={isSaving}
                  id="interview-scratchpad"
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      scratchpad: e.target.value,
                    }))
                  }
                  placeholder="준비 사항, 질문 등을 자유롭게 기록하세요"
                  rows={4}
                  value={values.scratchpad}
                />
              </div>

              {errorMessage !== null && (
                <p className="text-sm text-red-600" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  disabled={isSaving}
                  onClick={handleClose}
                  type="button"
                  variant="outline"
                >
                  취소
                </Button>
                <Button disabled={isSaving} type="submit">
                  {isSaving ? "저장하는 중..." : "저장"}
                </Button>
              </div>
            </form>
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}

function getInitialValues(props: InterviewFormSheetProps): FormValues {
  if (props.mode === "edit") {
    return {
      interviewType: props.interview.interviewType,
      location: props.interview.location ?? "",
      round: props.interview.round,
      scheduledAt: toDatetimeLocalValue(props.interview.scheduledAt),
      scratchpad: props.interview.scratchpad ?? "",
    };
  }
  return {
    interviewType: "TECH",
    location: "",
    round: props.defaultRound ?? 1,
    scheduledAt: "",
    scratchpad: "",
  };
}
