"use client";

import { ArrowUp as ArrowUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function GoToTopFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleClick() {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <>
      <div
        aria-hidden
        className="absolute top-0 h-px w-full"
        ref={sentinelRef}
      />
      <Button
        aria-label="맨 위로 이동"
        className={cn(
          "fixed right-5 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-40 shadow-lg transition-all duration-300 active:scale-95",
          isVisible
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-75 opacity-0",
        )}
        onClick={handleClick}
        size="fab"
        variant="outline"
      >
        <ArrowUpIcon />
      </Button>
    </>
  );
}
