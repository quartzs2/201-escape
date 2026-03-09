import { useCallback, useEffect, useRef, useState } from "react";

export type BottomSheetPhase = "closing" | "idle" | "open" | "opening";

type BottomSheetStateConfig = {
  isOpen: boolean;
  onAnimateIn: (onComplete: () => void) => void;
  onAnimateOut: (velocity: number, onComplete: () => void) => void;
  onClose: () => void;
};

export const useBottomSheetState = ({
  isOpen,
  onAnimateIn,
  onAnimateOut,
  onClose,
}: BottomSheetStateConfig) => {
  const [phase, setPhase] = useState<BottomSheetPhase>(() =>
    isOpen ? "opening" : "idle",
  );

  // async callback(rAF, 애니메이션 완료)에서 최신 phase를 읽기 위한 ref
  // effect body에서만 변경 (render 중 변경 금지)
  const phaseRef = useRef<BottomSheetPhase>(isOpen ? "opening" : "idle");

  // 드래그 종료 시 handleClose에서 설정, 애니메이션 완료 후 0으로 초기화
  const closingVelocityRef = useRef(0);

  const onCloseRef = useRef(onClose);
  const onAnimateInRef = useRef(onAnimateIn);
  const onAnimateOutRef = useRef(onAnimateOut);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onAnimateInRef.current = onAnimateIn;
  }, [onAnimateIn]);

  useEffect(() => {
    onAnimateOutRef.current = onAnimateOut;
  }, [onAnimateOut]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // phaseRef 동기화 — 반드시 애니메이션 effects보다 먼저 정의되어야 함
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // isOpen prop 변화 → phase 전환
  // React "derived state" 패턴: render 중 setState만 호출, ref 변경 없음
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);

    if (isOpen && (phase === "idle" || phase === "closing")) {
      setPhase("opening");
    } else if (!isOpen && phase === "open") {
      setPhase("closing");
      // closingVelocityRef는 이전 애니메이션 완료 시 0으로 초기화되어 있음
    }
  }

  // opening → DOM 삽입 타이밍 대기(이중 rAF) → 열기 애니메이션 시작
  useEffect(() => {
    if (phase !== "opening") {
      return;
    }

    let raf2: null | number = null;

    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (phaseRef.current !== "opening") {
          return;
        }

        onAnimateInRef.current(() => {
          if (phaseRef.current !== "opening") {
            return;
          }

          if (!isOpenRef.current) {
            // 애니메이션 중 isOpen이 false로 바뀐 경우 → 열기 완료 없이 바로 닫기
            setPhase("closing");
          } else {
            setPhase("open");
          }
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== null) {
        cancelAnimationFrame(raf2);
      }
    };
  }, [phase]);

  // closing → 닫기 애니메이션 시작
  useEffect(() => {
    if (phase !== "closing") {
      return;
    }

    onAnimateOutRef.current(closingVelocityRef.current, () => {
      if (phaseRef.current !== "closing") {
        return;
      }

      closingVelocityRef.current = 0;
      setPhase("idle");
      onCloseRef.current();
    });
  }, [phase]);

  const handleClose = useCallback((velocity = 0) => {
    if (phaseRef.current !== "open") {
      return;
    }

    closingVelocityRef.current = velocity;
    setPhase("closing");
  }, []);

  return {
    handleClose,
    isVisible: phase !== "idle",
    phase,
  };
};
