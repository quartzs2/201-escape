"use client";

import { usePathname } from "next/navigation";
import { useEffectEvent, useLayoutEffect } from "react";

// 여러 컴포넌트가 동시에 scroll lock을 요청할 때 올바르게 관리하기 위한 Set
const scrollLockOwners = new Set<object>();

// 첫 번째 lock 획득 시 저장, 마지막 lock 해제 시 복원
let lockState: null | { paddingRight: string; scrollY: number } = null;

export const useScrollLock = (isActive: boolean) => {
  const pathname = usePathname();
  const getLatestPathname = useEffectEvent(() => pathname);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }

    const token = {};
    // lock 획득 시점의 경로를 캡처 — cleanup 시 페이지 이동 여부 판단에 사용
    const acquiredPathname = getLatestPathname();
    scrollLockOwners.add(token);

    if (scrollLockOwners.size === 1) {
      // iOS Safari는 overflow: hidden을 무시하므로 position: fixed 방식 사용
      const scrollY = window.scrollY;
      // 스크롤바가 사라지면서 생기는 레이아웃 시프트를 패딩으로 보정
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      lockState = { paddingRight: document.body.style.paddingRight, scrollY };

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overscrollBehavior = "none";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      scrollLockOwners.delete(token);

      if (scrollLockOwners.size === 0 && lockState !== null) {
        const { paddingRight, scrollY } = lockState;
        lockState = null;

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overscrollBehavior = "";
        document.body.style.paddingRight = paddingRight;

        // 페이지가 변경된 경우 최상단으로, 동일 페이지면 원래 위치로 복원
        window.scrollTo(
          0,
          getLatestPathname() !== acquiredPathname ? 0 : scrollY,
        );
      }
    };
  }, [isActive]);
};
