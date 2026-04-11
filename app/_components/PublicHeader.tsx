import { LogInIcon } from "lucide-react";
import Link from "next/link";

import GitHubIcon from "@/assets/github.svg";
import { Button } from "@/components/ui/button/Button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#40513b]/10 bg-white/90 px-6 py-4 text-[#192016] backdrop-blur-xl lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          className="text-base font-bold tracking-[-0.03em] text-[#192016]"
          href="/"
        >
          201 escape
        </Link>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="h-9 w-9 rounded-full border border-[#40513b]/14 bg-white text-[#192016] hover:bg-[#eef1eb]"
            size="icon"
            variant="outline"
          >
            <a
              aria-label="GitHub 저장소"
              href="https://github.com/quartzs2/201-escape"
              rel="noreferrer"
              target="_blank"
            >
              <GitHubIcon className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            className="h-9 rounded-full bg-[#40513b] px-3.5 text-white hover:bg-[#354230]"
            size="sm"
          >
            <Link href="/login">
              시작하기
              <LogInIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
