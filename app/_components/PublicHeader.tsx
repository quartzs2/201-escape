import { LogIn } from "lucide-react";
import Link from "next/link";

import GitHubIcon from "@/assets/github.svg";
import { Button } from "@/components/ui/button/Button";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip/Tooltip";

export function PublicHeader() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
        <Button
          asChild
          className="text-lg font-bold hover:bg-transparent"
          variant="ghost"
        >
          <Link href="/">201</Link>
        </Button>
        <div className="flex items-center gap-1">
          <Tooltip label="GitHub">
            <Button asChild size="icon" variant="ghost">
              <a
                aria-label="GitHub 저장소"
                href="https://github.com/quartzs2/201-escape"
                rel="noreferrer"
                target="_blank"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </Button>
          </Tooltip>
          <Tooltip label="시작하기">
            <Button asChild size="icon" variant="ghost">
              <Link aria-label="시작하기" href="/login">
                <LogIn className="h-4 w-4" />
              </Link>
            </Button>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
