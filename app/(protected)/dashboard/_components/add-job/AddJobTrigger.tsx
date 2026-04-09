"use client";

import { Plus as PlusIcon } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import { BottomSheet, Button } from "@/components/ui";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

import { ManualFormView } from "./components/ManualFormView";
import { ReviewView } from "./components/ReviewView";
import { UrlInputView } from "./components/UrlInputView";
import { useAddJob } from "./hooks/useAddJob";

const PARSING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PARSING === "true";

export function AddJobTrigger() {
  const posthog = usePostHog();
  const [isOpen, setIsOpen] = useState(false);
  const {
    handleExtract,
    handleManualSubmit,
    handleReset,
    handleSave,
    reset,
    setUrl,
    state,
  } = useAddJob({
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
        onClick={() => {
          posthog.capture(POSTHOG_EVENTS.APPLICATION_ADD_OPENED);
          setIsOpen(true);
        }}
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
                    error={state.step === "idle" ? state.error : null}
                    onSubmit={handleManualSubmit}
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
