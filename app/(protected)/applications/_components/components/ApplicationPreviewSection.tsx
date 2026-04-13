import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ApplicationPreviewSectionProps = {
  body: string;
  className?: string;
  icon: ReactNode;
  isEmpty: boolean;
  title: string;
};

export function ApplicationPreviewSection({
  body,
  className,
  icon,
  isEmpty,
  title,
}: ApplicationPreviewSectionProps) {
  return (
    <section className={cn("space-y-2 py-1", className)}>
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p
        className={cn(
          "line-clamp-3 text-sm leading-6 font-medium whitespace-pre-wrap text-foreground",
          isEmpty && "text-muted-foreground",
        )}
      >
        {body}
      </p>
    </section>
  );
}
