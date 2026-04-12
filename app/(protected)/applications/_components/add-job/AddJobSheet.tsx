"use client";

import { BottomSheet } from "@/components/ui";

import { ManualFormView } from "./components/ManualFormView";
import { ReviewView } from "./components/ReviewView";
import { UrlInputView } from "./components/UrlInputView";
import { useAddJob } from "./hooks/useAddJob";

const PARSING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PARSING === "true";

type AddJobSheetProps = {
  isOpen: boolean;
  onCloseAction: () => void;
};

export function AddJobSheet({ isOpen, onCloseAction }: AddJobSheetProps) {
  const {
    defaultManualPositionTitle,
    handleExtract,
    handleManualSubmit,
    handleReset,
    handleSave,
    positionTitleSuggestions,
    reset,
    setUrl,
    state,
  } = useAddJob({
    onSuccess: onCloseAction,
  });

  function handleClose() {
    onCloseAction();
    reset();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose}>
      <BottomSheet.Overlay />
      <BottomSheet.Content>
        <BottomSheet.Header />
        <BottomSheet.Body>
          <BottomSheet.Title className="mb-4">공고 추가</BottomSheet.Title>
          {(() => {
            if (state.step === "idle" || state.step === "extracting") {
              if (PARSING_ENABLED) {
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
                <ManualFormView
                  defaultTitle={defaultManualPositionTitle}
                  error={state.step === "idle" ? state.error : null}
                  onSubmit={handleManualSubmit}
                  positionTitleSuggestions={positionTitleSuggestions}
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
  );
}
