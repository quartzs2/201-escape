"use client";

import { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { useTabsContext } from "../TabsContext";

export type TabsListProps = ComponentProps<"div">;

function TabsList({ className, onKeyDown, ...props }: TabsListProps) {
  const { orientation } = useTabsContext();

  const handleKeyDown: TabsListProps["onKeyDown"] = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ),
    );

    if (tabs.length === 0) {
      return;
    }

    const focusedTab = (
      event.target as HTMLElement | null
    )?.closest<HTMLButtonElement>('[role="tab"]');

    const currentIndex = focusedTab ? tabs.indexOf(focusedTab) : -1;

    if (currentIndex < 0) {
      return;
    }

    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

    const keyMap: Record<string, () => number> = {
      End: () => tabs.length - 1,
      Home: () => 0,
      [nextKey]: () => (currentIndex + 1) % tabs.length,
      [prevKey]: () => (currentIndex - 1 + tabs.length) % tabs.length,
    };

    const resolve = keyMap[event.key];

    if (!resolve) {
      return;
    }

    const nextIndex = resolve();

    event.preventDefault();
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      onKeyDown={handleKeyDown}
      role="tablist"
      {...(orientation && { "aria-orientation": orientation })}
      {...props}
    />
  );
}

TabsList.displayName = "Tabs.List";

export default TabsList;
