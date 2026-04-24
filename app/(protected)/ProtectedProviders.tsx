"use client";

import { type ComponentType, useEffect, useState } from "react";

export function ProtectedEnhancements() {
  const [BottomTabBar, setBottomTabBar] = useState<ComponentType | null>(null);
  const [WindowScrollTopFAB, setWindowScrollTopFAB] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const mountEnhancements = () => {
      void Promise.all([
        import("./_components/BottomTabBar"),
        import("./_components/WindowScrollTopFAB"),
      ]).then(([bottomTabBarModule, windowScrollTopFabModule]) => {
        if (isCancelled) {
          return;
        }

        setBottomTabBar(() => bottomTabBarModule.BottomTabBar);
        setWindowScrollTopFAB(
          () => windowScrollTopFabModule.WindowScrollTopFAB,
        );
      });
    };

    const requestIdle = window.requestIdleCallback;

    if (requestIdle) {
      const idleId = requestIdle(
        () => {
          mountEnhancements();
        },
        { timeout: 1200 },
      );

      return () => {
        isCancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      mountEnhancements();
    }, 400);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!BottomTabBar || !WindowScrollTopFAB) {
    return null;
  }

  return (
    <>
      <BottomTabBar />
      <WindowScrollTopFAB />
    </>
  );
}
