"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useGesture } from "@/hooks";

const ANIMATION_DURATION_MS = 300;
const TRANSFORM_HIDDEN = "translateY(100%)";
const TRANSFORM_VISIBLE = "translateY(0px)";

// 여러 바텀시트가 동시에 열릴 때 scroll lock을 올바르게 관리하기 위한 Set
const scrollLockOwners = new Set<object>();
const VELOCITY_CLOSE_THRESHOLD = 0.5;
const POSITION_CLOSE_RATIO = 0.3;
const FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const getTitleElement = (sheet: HTMLElement): HTMLElement | null => {
  const labelledElementId = sheet.getAttribute("aria-labelledby");
  if (!labelledElementId) {
    return null;
  }

  const titleElement = document.getElementById(labelledElementId);
  return titleElement instanceof HTMLElement ? titleElement : null;
};

const getFocusableTargets = (sheet: HTMLElement) => {
  const elements = sheet.querySelectorAll<HTMLElement>(
    FOCUSABLE_ELEMENTS_SELECTOR,
  );
  return {
    firstElement: elements[0] ?? null,
    lastElement: elements[elements.length - 1] ?? null,
    titleElement: getTitleElement(sheet),
  };
};

type BottomSheetConfig = {
  isOpen: boolean;
  onClose: () => void;
};

export const useBottomSheet = ({ isOpen, onClose }: BottomSheetConfig) => {
  const [isVisible, setIsVisible] = useState(false);
  // isOpen이 false → true로 반복 전환될 때, isVisible이 이미 true여도
  // 포커스 초기화 effect를 재실행하기 위한 카운터
  const [openCount, setOpenCount] = useState(0);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const prevFocusRef = useRef<HTMLElement | null>(null);
  const isVisibleRef = useRef(false);
  const isClosingRef = useRef(false);
  const closeTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const transitionEndListenerRef = useRef<
    ((e: TransitionEvent) => void) | null
  >(null);
  const attachedSheetRef = useRef<HTMLDivElement | null>(null);
  const closeTokenRef = useRef(0);

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (transitionEndListenerRef.current && attachedSheetRef.current) {
        attachedSheetRef.current.removeEventListener(
          "transitionend",
          transitionEndListenerRef.current,
        );
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    const sheet = sheetRef.current;
    if (!sheet || isClosingRef.current || !isVisibleRef.current) {
      return;
    }

    // 닫히는 도중 다시 열릴 경우 이전 cleanup이 실행되지 않도록 토큰으로 무효화
    closeTokenRef.current += 1;
    const closeToken = closeTokenRef.current;
    isClosingRef.current = true;

    const cleanup = () => {
      if (closeToken !== closeTokenRef.current) {
        return;
      }

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      if (transitionEndListenerRef.current && attachedSheetRef.current) {
        attachedSheetRef.current.removeEventListener(
          "transitionend",
          transitionEndListenerRef.current,
        );
        transitionEndListenerRef.current = null;
      }
      attachedSheetRef.current = null;

      isVisibleRef.current = false;
      setIsVisible(false);
      isClosingRef.current = false;
      onCloseRef.current();

      if (prevFocusRef.current) {
        const isFocusInSheet = sheetRef.current?.contains(
          document.activeElement,
        );
        const isFocusLost = document.activeElement === document.body;

        if (isFocusInSheet || isFocusLost) {
          prevFocusRef.current.focus();
        }
        prevFocusRef.current = null;
      }
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "transform" || e.target !== sheet) {
        return;
      }

      if (!isClosingRef.current) {
        return;
      }

      cleanup();
    };

    if (transitionEndListenerRef.current) {
      sheet.removeEventListener(
        "transitionend",
        transitionEndListenerRef.current,
      );
    }

    transitionEndListenerRef.current = onTransitionEnd;
    attachedSheetRef.current = sheet;
    sheet.addEventListener("transitionend", onTransitionEnd);
    sheet.style.transform = TRANSFORM_HIDDEN;

    closeTimerRef.current = setTimeout(() => {
      if (isClosingRef.current) {
        cleanup();
      }
    }, ANIMATION_DURATION_MS);
  }, []);

  useGesture({
    canDragFromScrollable: (translateY) => translateY > 0,
    enabled: isVisible,
    handleRef: headerRef,
    onDragEnd: ({ translateY, velocity }) => {
      const sheet = sheetRef.current;
      const isFastSwipe = velocity > VELOCITY_CLOSE_THRESHOLD;
      const isDraggedEnough =
        sheet !== null &&
        translateY > sheet.offsetHeight * POSITION_CLOSE_RATIO;
      const shouldClose = isFastSwipe || isDraggedEnough;

      if (shouldClose) {
        handleClose();
      } else if (sheet) {
        sheet.style.transform = TRANSFORM_VISIBLE;
      }
    },
    scrollableRef: contentRef,
    targetRef: sheetRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab" && sheetRef.current) {
        const { firstElement, lastElement, titleElement } = getFocusableTargets(
          sheetRef.current,
        );

        if (firstElement === null) {
          e.preventDefault();
          if (titleElement) {
            titleElement.focus();
          } else {
            sheetRef.current.focus();
          }
          return;
        }

        if (!sheetRef.current.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
          return;
        }

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            document.activeElement === sheetRef.current
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeTokenRef.current += 1;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (transitionEndListenerRef.current && attachedSheetRef.current) {
      attachedSheetRef.current.removeEventListener(
        "transitionend",
        transitionEndListenerRef.current,
      );
      transitionEndListenerRef.current = null;
    }

    prevFocusRef.current = document.activeElement as HTMLElement;
    isClosingRef.current = false;

    // Content의 초기 transform(translateY(100%))이 DOM에 먼저 적용된 후
    // 애니메이션이 시작되도록 렌더링 이후 다음 태스크로 지연
    const timer = setTimeout(() => {
      isVisibleRef.current = true;
      setIsVisible(true);
      setOpenCount((c) => c + 1);
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isVisible || !sheetRef.current || isClosingRef.current) {
      return;
    }

    let raf2: number | undefined;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (sheetRef.current) {
          const { firstElement, titleElement } = getFocusableTargets(
            sheetRef.current,
          );

          sheetRef.current.style.transform = TRANSFORM_VISIBLE;
          if (firstElement) {
            firstElement.focus();
            return;
          }

          if (titleElement) {
            titleElement.focus();
            return;
          }

          sheetRef.current.focus();
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) {
        cancelAnimationFrame(raf2);
      }
    };
  }, [isVisible, openCount]);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    if (!isVisible || isClosingRef.current) {
      return;
    }

    handleClose();
  }, [isOpen, isVisible, handleClose]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const token = {};
    scrollLockOwners.add(token);

    if (scrollLockOwners.size === 1) {
      document.documentElement.style.scrollbarGutter = "stable";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    }

    return () => {
      scrollLockOwners.delete(token);

      if (scrollLockOwners.size === 0) {
        document.documentElement.style.scrollbarGutter = "";
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      }
    };
  }, [isVisible]);

  return { contentRef, handleClose, headerRef, isVisible, sheetRef };
};
