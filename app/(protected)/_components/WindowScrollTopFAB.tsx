"use client";

import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";

import { GoToTopFAB } from "./GoToTopFAB";

const VISIBILITY_SCROLL_Y = 280;

export function WindowScrollTopFAB() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const updateVisibility = useEffectEvent(() => {
    setIsVisible(window.scrollY > VISIBILITY_SCROLL_Y);
  });

  useEffect(() => {
    if (pathname === "/applications") {
      return;
    }

    updateVisibility();

    const handleScroll = () => {
      updateVisibility();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  if (pathname === "/applications") {
    return null;
  }

  return (
    <GoToTopFAB
      isVisible={isVisible}
      onScrollToTop={() => window.scrollTo({ behavior: "smooth", top: 0 })}
    />
  );
}
