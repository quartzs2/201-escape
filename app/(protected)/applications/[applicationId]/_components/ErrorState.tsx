import type { LucideIcon } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

export type ErrorStateProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function ErrorState({
  description,
  icon: Icon,
  title,
}: ErrorStateProps) {
  return (
    <section className="mt-10 py-8 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        <div className="flex size-12 items-center justify-center text-muted-foreground">
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <div className="space-y-3">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-6 font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <Button asChild className="h-10 px-4 text-sm">
          <Link href="/dashboard">지원 현황으로 돌아가기</Link>
        </Button>
      </div>
    </section>
  );
}
