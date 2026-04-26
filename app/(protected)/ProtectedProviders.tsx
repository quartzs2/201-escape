"use client";

import { type ComponentType, useEffect, useState } from "react";

import { BottomTabBar } from "./_components/BottomTabBar";

export function ProtectedEnhancements() {
  const [WindowScrollTopFAB, setWindowScrollTopFAB] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const mountEnhancements = () => {
      void import("./_components/WindowScrollTopFAB").then((module) => {
        if (isCancelled) {
          return;
        }

        setWindowScrollTopFAB(() => module.WindowScrollTopFAB);
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

  return (
    <>
      <BottomTabBar />
      {WindowScrollTopFAB ? <WindowScrollTopFAB /> : null}
    </>
  );
}
