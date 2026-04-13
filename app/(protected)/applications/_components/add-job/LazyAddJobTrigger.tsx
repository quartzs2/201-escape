"use client";

import dynamic from "next/dynamic";

import { useIdleMount } from "@/hooks/useIdleMount";

const AddJobTrigger = dynamic(
  () => import("./AddJobTrigger").then((module) => module.AddJobTrigger),
  { ssr: false },
);

export function LazyAddJobTrigger() {
  const shouldMount = useIdleMount({
    fallbackDelayMs: 800,
    timeoutMs: 1500,
  });

  if (!shouldMount) {
    return null;
  }

  return <AddJobTrigger />;
}
