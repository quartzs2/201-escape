import { LogOutIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";
import { signOut } from "@/lib/actions/signOut";

import { HeaderNavLinks } from "./HeaderNavLinks";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Button
            asChild
            className="text-xl font-black tracking-tighter text-primary hover:bg-transparent"
            variant="ghost"
          >
            <Link href="/dashboard">201</Link>
          </Button>
          <nav aria-label="주 내비게이션" className="hidden md:flex">
            <HeaderNavLinks />
          </nav>
        </div>
        <form action={signOut}>
          <Button
            aria-label="로그아웃"
            size="icon"
            title="로그아웃"
            type="submit"
            variant="ghost"
          >
            <LogOutIcon aria-hidden="true" />
          </Button>
        </form>
      </div>
    </header>
  );
}
