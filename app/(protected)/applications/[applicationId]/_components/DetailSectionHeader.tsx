import type { ReactNode } from "react";

type DetailSectionHeaderProps = {
  action?: ReactNode;
  description?: string;
  headingId?: string;
  icon: ReactNode;
  title: string;
};

export function DetailSectionHeader({
  action,
  description,
  headingId,
  icon,
  title,
}: DetailSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
          {icon}
        </span>
        <div className="min-w-0 space-y-1">
          <h2
            className="text-base font-semibold tracking-tight text-foreground"
            id={headingId}
          >
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-relaxed font-medium text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
