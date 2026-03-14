import { useRef } from "react";

import { useDrag } from "@/hooks/useDrag";
import { useScrollLock } from "@/hooks/useScrollLock";
import { SpringAnimator } from "@/lib/utils/SpringAnimator";

import { useBottomSheetState } from "./useBottomSheetState";

const SPRING_STIFFNESS = 400;
const SPRING_DAMPING = 35;
const SPRING_MASS = 1;

// 드래그 종료 시 닫힘 판단 기준
const VELOCITY_CLOSE_THRESHOLD = 500; // px/s (EMA 속도 기준)
const POSITION_CLOSE_RATIO = 0.4; // 시트 높이 대비 비율

type BottomSheetConfig = {
  isOpen: boolean;
  onClose: () => void;
};

export const useBottomSheet = ({ isOpen, onClose }: BottomSheetConfig) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // SpringAnimator는 lazy 생성 — onUpdate가 sheetRef를 닫아 안정적
  const springRef = useRef<null | SpringAnimator>(null);

  const getSpring = (): SpringAnimator => {
    if (!springRef.current) {
      springRef.current = new SpringAnimator({
        damping: SPRING_DAMPING,
        mass: SPRING_MASS,
        onUpdate: (position) => {
          if (sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${position}px)`;
          }
        },
        stiffness: SPRING_STIFFNESS,
      });
    }

    return springRef.current;
  };

  // useBottomSheetState에 넘기는 콜백 — refs를 통해 항상 최신값 참조
  const onAnimateIn = (onComplete: () => void) => {
    const sheet = sheetRef.current;

    if (!sheet) {
      onComplete();
      return;
    }

    const spring = getSpring();

    // 화면 아래(offsetHeight)에서 출발해 0으로 애니메이션
    spring.setPosition(sheet.offsetHeight);
    spring.animateTo(0, 0, onComplete);
  };

  const onAnimateOut = (velocity: number, onComplete: () => void) => {
    const sheet = sheetRef.current;

    if (!sheet) {
      onComplete();
      return;
    }

    const spring = getSpring();

    // 현재 spring 위치(drag 후 동기화된 값 또는 0)에서 화면 아래로 애니메이션
    spring.animateTo(sheet.offsetHeight, velocity, onComplete);
  };

  const { handleClose, isVisible, phase } = useBottomSheetState({
    isOpen,
    onAnimateIn,
    onAnimateOut,
    onClose,
  });

  // 드래그는 완전히 열린 상태(open)에서만 활성화
  useDrag({
    enabled: phase === "open",
    handleRef,
    onDragEnd: ({ translateY, velocity }) => {
      const sheet = sheetRef.current;
      const spring = getSpring();

      const isFastSwipe = velocity > VELOCITY_CLOSE_THRESHOLD;
      const isDraggedEnough =
        sheet !== null &&
        translateY > sheet.offsetHeight * POSITION_CLOSE_RATIO;
      const shouldClose = isFastSwipe || isDraggedEnough;

      // 드래그로 이동한 위치를 spring에 동기화한 뒤 스냅 방향 결정
      spring.setPosition(translateY);

      if (shouldClose) {
        // handleClose → phase "closing" → onAnimateOut(velocity) 호출 체인
        handleClose(velocity);
      } else {
        spring.animateTo(0, velocity);
      }
    },
    targetRef: sheetRef,
  });

  useScrollLock(isVisible);

  return { handleClose, handleRef, isVisible, phase, sheetRef };
};
