"use client";

import { Plus as PlusIcon } from "lucide-react";
import { useState } from "react";

import type { JobPlatform, JobPost } from "@/lib/types/job";

import { BottomSheet, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import { PLATFORM_LABEL } from "../dashboard-view/constants";
import { useAddJob } from "./hooks/useAddJob";

type ReviewFieldProps = {
  label: string;
  value: string;
};

type ReviewViewProps = {
  error: null | string;
  isSaving: boolean;
  jobData: JobPost;
  onReset: () => void;
  onSave: () => void;
};

type UrlInputViewProps = {
  error: null | string;
  isLoading: boolean;
  onExtract: () => void;
  onUrlChange: (url: string) => void;
  url: string;
};

export function AddJobTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { handleExtract, handleReset, handleSave, reset, setUrl, state } =
    useAddJob({
      onSuccess: () => setIsOpen(false),
    });

  function handleClose() {
    setIsOpen(false);
    reset();
  }

  return (
    <>
      <Button
        aria-label="공고 추가"
        className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+2rem)] z-40 shadow-lg transition-transform active:scale-95"
        onClick={() => setIsOpen(true)}
        size="fab"
      >
        <PlusIcon />
      </Button>

      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          <BottomSheet.Header />
          <BottomSheet.Body>
            <BottomSheet.Title className="mb-4">공고 추가</BottomSheet.Title>
            {(() => {
              if (state.step === "idle" || state.step === "extracting") {
                return (
                  <UrlInputView
                    error={state.step === "idle" ? state.error : null}
                    isLoading={state.step === "extracting"}
                    onExtract={handleExtract}
                    onUrlChange={setUrl}
                    url={state.url}
                  />
                );
              }

              return (
                <ReviewView
                  error={state.step === "review" ? state.error : null}
                  isSaving={state.step === "saving"}
                  jobData={state.jobData}
                  onReset={handleReset}
                  onSave={handleSave}
                />
              );
            })()}
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ReviewView({
  error,
  isSaving,
  jobData,
  onReset,
  onSave,
}: ReviewViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg bg-muted p-4">
        <ReviewField label="회사" value={jobData.companyName} />
        <ReviewField label="포지션" value={jobData.title} />
        <ReviewField
          label="플랫폼"
          value={PLATFORM_LABEL[jobData.platform as JobPlatform]}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isSaving}
          onClick={onReset}
          variant="outline"
        >
          다시 입력
        </Button>
        <Button className="flex-1" disabled={isSaving} onClick={onSave}>
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

function UrlInputView({
  error,
  isLoading,
  onExtract,
  onUrlChange,
  url,
}: UrlInputViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="job-url"
        >
          공고 URL
        </label>
        <input
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus:ring-1 focus:ring-ring focus:outline-none",
            error && "border-destructive",
          )}
          disabled={isLoading}
          id="job-url"
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onExtract();
            }
          }}
          placeholder="https://www.wanted.co.kr/..."
          type="url"
          value={url}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button
        className="w-full"
        disabled={!url.trim() || isLoading}
        onClick={onExtract}
      >
        {isLoading ? "공고 정보 가져오는 중..." : "공고 정보 가져오기"}
      </Button>
    </div>
  );
}
