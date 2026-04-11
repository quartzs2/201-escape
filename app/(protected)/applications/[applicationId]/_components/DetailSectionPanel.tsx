import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailSectionPanelProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
};

export function DetailSectionPanel({
  children,
  className,
  ...props
}: DetailSectionPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border/60 bg-background/95 p-5 shadow-[0_24px_60px_-36px_rgba(23,23,23,0.28)] backdrop-blur-sm sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
