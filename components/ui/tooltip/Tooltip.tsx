import { cn } from "@/lib/utils/cn";

export type TooltipProps = {
  className?: string;
  description?: string;
  open?: boolean;
  title: string;
  value: string;
  x: number;
  y: number;
};

export function Tooltip({
  className,
  description,
  open = true,
  title,
  value,
  x,
  y,
}: TooltipProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-10 w-max max-w-56 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur",
        className,
      )}
      style={{
        left: x,
        top: y,
      }}
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
