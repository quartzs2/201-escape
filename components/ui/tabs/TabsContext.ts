"use client";

import { createContext, useContext } from "react";

export type TabsContextValue = {
  baseId: string;
  orientation: TabsOrientation;
  setValue: (nextValue: string) => void;
  value?: string;
};

export type TabsOrientation = "horizontal" | "vertical";

export const TabsContext = createContext<null | TabsContextValue>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(
      "Tabs 컴파운드 컴포넌트는 Tabs.Root 안에서 사용해야 합니다.",
    );
  }

  return context;
};
