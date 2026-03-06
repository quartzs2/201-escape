"use client";

import { RefObject, useEffect, useEffectEvent, useRef } from "react";

import { VelocityTracker } from "@/lib/utils";

const RUBBER_BAND_FRICTION = 3.5;

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

type DragConfig = {
  enabled: boolean;
  handleRef?: RefObject<HTMLElement | null>;
  onDragEnd: (state: DragEndState) => void;
  targetRef: RefObject<HTMLElement | null>;
};

type DragEndState = {
  translateY: number;
  velocity: number;
};

export const useDrag = ({
  enabled,
  handleRef,
  onDragEnd,
  targetRef,
}: DragConfig) => {
  const onDragEndEvent = useEffectEvent(onDragEnd);

  const activePointerIdRef = useRef<null | number>(null);
  const startYRef = useRef(0);
  const startTargetYRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const latestTranslateYRef = useRef(0);
  const rafRef = useRef<null | number>(null);
  const velocityTrackerRef = useRef(new VelocityTracker());

  useEffect(() => {
    if (!enabled || !targetRef.current) {
      return;
    }

    const target = targetRef.current;
    const handle = handleRef?.current ?? null;

    const handlePointerDown = (e: PointerEvent) => {
      // 멀티터치 방어: 이미 드래그 중이면 무시
      if (activePointerIdRef.current !== null) {
        return;
      }

      const isFromHandle = handle ? handle.contains(e.target as Node) : true;
      if (!isFromHandle) {
        return;
      }

      activePointerIdRef.current = e.pointerId;

      const targetY = getTranslateY(target);
      startYRef.current = e.clientY;
      startTargetYRef.current = targetY;
      hasDraggedRef.current = false;
      latestTranslateYRef.current = targetY;

      velocityTrackerRef.current.reset();
      velocityTrackerRef.current.track(e.clientY, performance.now());
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) {
        return;
      }

      velocityTrackerRef.current.track(e.clientY, performance.now());

      if (!hasDraggedRef.current) {
        // 첫 move 시점에 capture — click 이벤트 억제를 방지하기 위해 pointerdown에서 지연
        target.setPointerCapture(e.pointerId);
        target.style.willChange = "transform";
        target.style.transition = "none";
      }

      hasDraggedRef.current = true;

      const moveDistance = e.clientY - startYRef.current;
      const newY = startTargetYRef.current + moveDistance;
      const nextTranslateY = newY < 0 ? newY / RUBBER_BAND_FRICTION : newY;

      latestTranslateYRef.current = nextTranslateY;

      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        target.style.transform = `translateY(${latestTranslateYRef.current}px)`;
        rafRef.current = null;
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerIdRef.current) {
        return;
      }

      activePointerIdRef.current = null;

      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      target.style.willChange = "";
      target.style.transition = "";

      if (!hasDraggedRef.current) {
        return;
      }

      onDragEndEvent({
        translateY: latestTranslateYRef.current,
        velocity: velocityTrackerRef.current.getVelocity(),
      });
    };

    target.addEventListener("pointerdown", handlePointerDown);
    target.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerup", handlePointerUp);
    target.addEventListener("pointercancel", handlePointerUp);

    return () => {
      target.removeEventListener("pointerdown", handlePointerDown);
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerup", handlePointerUp);
      target.removeEventListener("pointercancel", handlePointerUp);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      target.style.willChange = "";
      target.style.transition = "";
      activePointerIdRef.current = null;
    };
  }, [targetRef, handleRef, enabled]);
};
