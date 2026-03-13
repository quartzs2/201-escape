import type { ReactNode } from "react";

export type DetailSectionProps = {
  body: string;
  icon: ReactNode;
  title: string;
};

export function DetailSection({ body, icon, title }: DetailSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
      </div>
      <p className="text-[15px] leading-8 wrap-break-word whitespace-pre-wrap text-foreground">
        {body}
      </p>
    </section>
  );
}
