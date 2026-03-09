"use client";

import { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

import { useTabsContext } from "../TabsContext";
import { getContentId, getTriggerId } from "../utils/utils";

export type TabsTriggerProps = ComponentProps<"button"> & {
  value: string;
};

function TabsTrigger({
  className,
  disabled,
  onClick,
  ref,
  type = "button",
  value,
  ...props
}: TabsTriggerProps) {
  const { baseId, setValue, value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;
  const triggerId = getTriggerId(baseId, value);
  const contentId = getContentId(baseId, value);

  const handleClick: TabsTriggerProps["onClick"] = (event) => {
    onClick?.(event);

    if (event.defaultPrevented || disabled) {
      return;
    }

    setValue(value);
  };

  return (
    <button
      aria-controls={contentId}
      aria-selected={isSelected}
      className={cn(
        [
          "inline-flex cursor-pointer items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap",
          "ring-offset-background transition-all",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        ],
        className,
      )}
      data-state={isSelected ? "active" : "inactive"}
      disabled={disabled}
      id={triggerId}
      onClick={handleClick}
      ref={ref}
      role="tab"
      tabIndex={isSelected ? 0 : -1}
      type={type}
      {...props}
    />
  );
}

TabsTrigger.displayName = "Tabs.Trigger";

export default TabsTrigger;
