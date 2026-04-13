import { LogOutIcon } from "lucide-react";

import { HeaderActions } from "@/app/_components/HeaderActions";
import { Button } from "@/components/ui/button/Button";
import { signOut } from "@/lib/actions/signOut";

import { NAV_ITEMS } from "./nav-items";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Button
            asChild
            className="text-xl font-bold tracking-tighter text-primary hover:bg-transparent"
            variant="ghost"
          >
            <a href="/dashboard">201</a>
          </Button>
          <nav aria-label="주 내비게이션" className="hidden md:flex">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Button
                    asChild
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    variant="ghost"
                  >
                    <a href={href}>{label}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <HeaderActions />
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
      </div>
    </header>
  );
}
