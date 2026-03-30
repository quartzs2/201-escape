"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";

type TooltipProps = {
  children: React.ReactNode;
  label: string;
  side?: RadixTooltip.TooltipContentProps["side"];
};

export function Tooltip({ children, label, side = "bottom" }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="z-50 animate-fade-in rounded-md bg-foreground px-2.5 py-1 text-xs text-background"
          side={side}
          sideOffset={6}
        >
          {label}
          <RadixTooltip.Arrow className="fill-foreground" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={400}>
      {children}
    </RadixTooltip.Provider>
  );
}
