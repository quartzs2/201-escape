"use client";

import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils/cn";

import {
  isNavItemActive,
  NAV_ITEMS,
} from "../(protected)/_components/nav-items";
import { HeaderActions } from "./HeaderActions";

const PROTECTED_PATH_PREFIXES = ["/dashboard", "/applications"] as const;

type ErrorPageShellProps = {
  children: React.ReactNode;
  pathname: string;
};

export function ErrorPageShell({ children, pathname }: ErrorPageShellProps) {
  const isProtectedPath = getIsProtectedPath(pathname);

  return (
    <div className="min-h-screen bg-muted/30">
      {isProtectedPath ? (
        <ProtectedErrorHeader pathname={pathname} />
      ) : (
        <PublicErrorHeader />
      )}
      <main className={cn(isProtectedPath && "pt-16")}>{children}</main>
    </div>
  );
}

function getIsProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function ProtectedErrorHeader({ pathname }: { pathname: string }) {
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
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive = isNavItemActive(pathname, href);

                return (
                  <li key={href}>
                    <Button
                      asChild
                      className={cn(
                        "text-sm font-medium",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      variant="ghost"
                    >
                      <a
                        aria-current={isActive ? "page" : undefined}
                        href={href}
                      >
                        {label}
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <HeaderActions />
      </div>
    </header>
  );
}

function PublicErrorHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 text-foreground backdrop-blur-xl lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Error recovery must force a full document navigation. */}
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
