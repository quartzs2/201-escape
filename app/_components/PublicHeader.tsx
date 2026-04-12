import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button/Button";

import { HeaderActions } from "./HeaderActions";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 text-foreground backdrop-blur-xl lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Public entrypoints intentionally avoid client navigation JS. */}
        <a
          className="text-base font-bold tracking-[-0.03em] text-foreground"
          href="/"
        >
          201 escape
        </a>

        <div className="flex items-center gap-2">
          <HeaderActions />
          <Button asChild size="icon" title="로그인" variant="ghost">
            <a aria-label="로그인" href="/login">
              <LogInIcon className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
