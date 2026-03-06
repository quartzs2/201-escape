"use client";

import { useEffect } from "react";

// 여러 컴포넌트가 동시에 scroll lock을 요청할 때 올바르게 관리하기 위한 Set
const scrollLockOwners = new Set<object>();

export const useScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) {
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
  }, [isActive]);
};
