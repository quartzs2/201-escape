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
  children,
  className,
  forceMount = false,
  ref,
  value,
  ...props
}: TabsContentProps) {
  const { baseId, value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  // 패널은 항상 DOM에 존재해야 TabsTrigger의 aria-controls 참조가 유효합니다.
  // forceMount=false 시 children만 언마운트하고 컨테이너는 유지합니다.
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
    >
      {forceMount || isSelected ? children : null}
    </div>
  );
}

TabsContent.displayName = "Tabs.Content";

export default TabsContent;
