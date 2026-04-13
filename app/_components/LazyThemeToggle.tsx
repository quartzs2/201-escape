"use client";

import dynamic from "next/dynamic";

import { useIdleMount } from "@/hooks/useIdleMount";

const ThemeToggle = dynamic(
  () => import("./ThemeToggle").then((module) => module.ThemeToggle),
  { ssr: false },
);

export function LazyThemeToggle() {
  const shouldMount = useIdleMount();

  if (!shouldMount) {
    return <div aria-hidden="true" className="h-9 w-9 shrink-0" />;
  }

  return <ThemeToggle />;
}
