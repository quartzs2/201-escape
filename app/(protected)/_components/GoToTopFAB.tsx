"use client";

import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type GoToTopFABProps = {
  className?: string;
  isVisible: boolean;
  onScrollToTop: () => void;
};

export function GoToTopFAB({
  className,
  isVisible,
  onScrollToTop,
}: GoToTopFABProps) {
  return (
    <Button
      aria-hidden={!isVisible}
      aria-label="맨 위로 이동"
      className={cn(
        "fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-40 shadow-lg transition-all duration-300 active:scale-95 md:bottom-6",
        className,
        isVisible
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-75 opacity-0",
      )}
      onClick={onScrollToTop}
      size="fab"
      tabIndex={isVisible ? undefined : -1}
      variant="outline"
    >
      <ArrowUpIcon aria-hidden="true" />
    </Button>
  );
}
