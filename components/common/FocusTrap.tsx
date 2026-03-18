"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const TITLE_SELECTOR =
  "h1[tabindex], h2[tabindex], h3[tabindex], h4[tabindex], h5[tabindex], h6[tabindex]";

type FocusTrapProps = {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement | null>;
  isActive: boolean;
};

export function FocusTrap({
  children,
  containerRef,
  isActive,
}: FocusTrapProps) {
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // 초기 포커스 지정 및 포커스 복원
  useEffect(() => {
    if (!isActive) {
      prevFocusRef.current?.focus();
      prevFocusRef.current = null;
      return;
    }

    prevFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // WAI-ARIA 다이얼로그 패턴: titleElement → firstElement → container
    const firstElement =
      container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    const titleElement = container.querySelector<HTMLElement>(TITLE_SELECTOR);
    const focusTarget = titleElement ?? firstElement ?? container;

    const rafId = requestAnimationFrame(() => {
      focusTarget.focus();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isActive, containerRef]);

  // Tab 순환 로직
  useEffect(() => {
    if (!isActive) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1)!;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, containerRef]);

  return <>{children}</>;
}
