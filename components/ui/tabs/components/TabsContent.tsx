"use client";

import { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { useTabsContext } from "../TabsContext";
import { getContentId, getTriggerId } from "../utils/utils";

export type TabsContentProps = ComponentProps<"div"> & {
  forceMount?: boolean;
  value: string;
};

function TabsContent({
  className,
  forceMount = false,
  ref,
  value,
  ...props
}: TabsContentProps) {
  const { baseId, value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!forceMount && !isSelected) {
    return null;
  }

  return (
    <div
      aria-labelledby={getTriggerId(baseId, value)}
      className={cn(
        "mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      data-state={isSelected ? "active" : "inactive"}
      hidden={!isSelected}
      id={getContentId(baseId, value)}
      ref={ref}
      role="tabpanel"
      tabIndex={0}
      {...props}
    />
  );
}

TabsContent.displayName = "Tabs.Content";

export default TabsContent;
