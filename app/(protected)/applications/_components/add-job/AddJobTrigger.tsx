"use client";

import { Plus as PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button/Button";
import { trackEvent } from "@/lib/analytics/client";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const AddJobSheet = dynamic(
  () => import("./AddJobSheet").then((module) => module.AddJobSheet),
  { ssr: false },
);

export function AddJobTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderSheet, setShouldRenderSheet] = useState(false);

  return (
    <>
      <Button
        aria-label="공고 추가"
        className="fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+2rem)] z-40 shadow-lg transition-transform active:scale-95"
        onClick={() => {
          trackEvent(ANALYTICS_EVENTS.APPLICATION_ADD_OPENED);
          setShouldRenderSheet(true);
          setIsOpen(true);
        }}
        size="fab"
      >
        <PlusIcon />
      </Button>

      {shouldRenderSheet && (
        <AddJobSheet isOpen={isOpen} onCloseAction={() => setIsOpen(false)} />
      )}
    </>
  );
}
