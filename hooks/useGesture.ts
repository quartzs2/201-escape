import { RefObject, useEffect, useRef } from "react";

const OVERSCROLL_SNAP_THRESHOLD = -30;
const RUBBER_BAND_FRICTION = 3.5;
const RELEASE_TRANSITION = "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
const VELOCITY_INSTANT_WEIGHT = 0.8;
const VELOCITY_SMOOTH_WEIGHT = 1 - VELOCITY_INSTANT_WEIGHT;

const getInitialMetrics = () => ({
  hasDragged: false,
  isHandleTouched: false,
  isScrollableTouched: false,
  touchMove: {
    lastTime: 0,
    lastY: 0,
    movingDirection: "none" as "down" | "none" | "up",
    prevTouchY: 0,
    velocity: 0,
  },
  touchStart: { targetY: 0, touchY: 0 },
});

const getClientY = (e: MouseEvent | TouchEvent): null | number => {
  if ("touches" in e) {
    if (e.touches.length === 0) {
      return null;
    }

    return e.touches[0].clientY;
  }
  return e.clientY;
};

const getTranslateY = (element: HTMLElement): number => {
  try {
    const transform = window.getComputedStyle(element).transform;

    if (!transform || transform === "none") {
      return 0;
    }

    return new DOMMatrix(transform).m42;
  } catch {
    return 0;
  }
};

type DragEndState = {
  translateY: number;
  velocity: number;
};

type GestureConfig = {
  enabled: boolean;
  handleRef?: RefObject<HTMLElement | null>;
  onDragEnd: (state: DragEndState) => void;
  rubberBand?: boolean;
  scrollableRef?: RefObject<HTMLElement | null>;
  targetRef: RefObject<HTMLElement | null>;
};

export const useGesture = ({
  enabled,
  handleRef,
  onDragEnd,
  rubberBand = true,
  scrollableRef,
  targetRef,
}: GestureConfig) => {
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);

  const metrics = useRef(getInitialMetrics());

  const rafRef = useRef<null | number>(null);
  const latestTranslateYRef = useRef(0);
  const isMouseDraggingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !targetRef.current) {
      return;
    }

    const target = targetRef.current;
    const scrollable = scrollableRef?.current ?? null;
    const handle = handleRef?.current ?? null;

    const canDrag = (e: MouseEvent | TouchEvent) => {
      const { isHandleTouched, isScrollableTouched, touchMove, touchStart } =
        metrics.current;

      const eventTarget = e.target as Node | null;
      if (!eventTarget) {
        return false;
      }

      if (isHandleTouched) {
        return true;
      }
      // 시트가 이미 아래로 내려간 상태에서는 스크롤 영역 밖이어도 드래그 허용
      if (touchStart.targetY > 0 && !isScrollableTouched) {
        return true;
      }
      if (target.contains(eventTarget) && !scrollable?.contains(eventTarget)) {
        return true;
      }

      if (isScrollableTouched && touchMove.movingDirection === "down") {
        return (scrollable?.scrollTop ?? 0) === 0;
      }

      return false;
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches.length > 1) {
        return;
      }

      const currentY = getClientY(e);
      if (currentY === null) {
        return;
      }

      const eventTarget = e.target as Node | null;
      if (!eventTarget) {
        return;
      }
      const isHandle = handle?.contains(eventTarget) ?? false;

      if (e instanceof MouseEvent && isHandle) {
        e.preventDefault();
      }

      const now = performance.now();
      const targetY = getTranslateY(target);

      metrics.current = {
        hasDragged: false,
        isHandleTouched: isHandle,
        isScrollableTouched: scrollable?.contains(eventTarget) ?? false,
        touchMove: {
          lastTime: now,
          lastY: currentY,
          movingDirection: "none",
          prevTouchY: currentY,
          velocity: 0,
        },
        touchStart: { targetY, touchY: currentY },
      };

      latestTranslateYRef.current = targetY;

      target.style.willChange = "transform";
      target.style.transition = "none";
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.buttons !== 1) {
        return;
      }

      const currentY = getClientY(e);
      if (currentY === null) {
        return;
      }

      const { touchMove, touchStart } = metrics.current;

      if (touchMove.prevTouchY < currentY) {
        touchMove.movingDirection = "down";
      } else if (touchMove.prevTouchY > currentY) {
        touchMove.movingDirection = "up";
      }
      touchMove.prevTouchY = currentY;

      const now = performance.now();
      const dt = now - touchMove.lastTime;

      if (dt > 0) {
        const instantVelocity = (currentY - touchMove.lastY) / dt;
        touchMove.velocity =
          instantVelocity * VELOCITY_INSTANT_WEIGHT +
          touchMove.velocity * VELOCITY_SMOOTH_WEIGHT;
        touchMove.lastY = currentY;
        touchMove.lastTime = now;
      }

      if (!canDrag(e)) {
        return;
      }

      metrics.current.hasDragged = true;

      if (e.cancelable) {
        e.preventDefault();
        e.stopPropagation();
      }

      const moveDistance = currentY - touchStart.touchY;
      const newY = touchStart.targetY + moveDistance;
      const nextTranslateY =
        rubberBand && newY < 0 ? newY / RUBBER_BAND_FRICTION : newY;

      latestTranslateYRef.current = nextTranslateY;

      if (rafRef.current) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        target.style.transform = `translateY(${latestTranslateYRef.current}px)`;
        rafRef.current = null;
      });
    };

    const handleEnd = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      target.style.willChange = "";

      const { hasDragged, touchMove } = metrics.current;

      if (!hasDragged) {
        target.style.transition = "";

        return;
      }

      target.style.transition = RELEASE_TRANSITION;

      const currentY = latestTranslateYRef.current;
      const velocity = touchMove.velocity;

      if (currentY < OVERSCROLL_SNAP_THRESHOLD) {
        target.style.transform = "translateY(0px)";
        onDragEndRef.current({ translateY: 0, velocity: 0 });
      } else {
        onDragEndRef.current({ translateY: currentY, velocity });
      }

      metrics.current = getInitialMetrics();
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      handleEnd();
    };

    const handleTouchStart = (e: TouchEvent) => {
      handleStart(e);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("touchcancel", handleTouchEnd);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDraggingRef.current) {
        return;
      }
      handleMove(e);
    };

    const handleMouseUp = () => {
      if (!isMouseDraggingRef.current) {
        return;
      }

      isMouseDraggingRef.current = false;
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      handleEnd();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isMouseDraggingRef.current) {
        return;
      }

      isMouseDraggingRef.current = true;
      document.body.style.userSelect = "none";
      handleStart(e);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    target.addEventListener("touchstart", handleTouchStart, { passive: true });
    target.addEventListener("mousedown", handleMouseDown);

    return () => {
      target.removeEventListener("touchstart", handleTouchStart);
      target.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      isMouseDraggingRef.current = false;
      document.body.style.userSelect = "";

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      target.style.willChange = "";
      target.style.transition = "";
      // transform은 외부에서 닫기 애니메이션으로 관리하므로 여기서는 초기화하지 않음
      // (초기화 시 애니메이션이 끝나기 전에 요소가 순간적으로 원위치로 표시될 수 있음)
    };
  }, [targetRef, scrollableRef, handleRef, rubberBand, enabled]);
};
