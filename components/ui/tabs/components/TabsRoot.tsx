"use client";

import { ComponentProps, useId, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { TabsContext, TabsOrientation } from "../TabsContext";

export type TabsRootProps = ComponentProps<"div"> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  value?: string;
};

function TabsRoot({
  children,
  className,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  value,
  ...props
}: TabsRootProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return (
    <TabsContext
      value={{
        baseId: generatedId,
        orientation,
        setValue,
        value: currentValue,
      }}
    >
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext>
  );
}

TabsRoot.displayName = "Tabs.Root";

export default TabsRoot;
