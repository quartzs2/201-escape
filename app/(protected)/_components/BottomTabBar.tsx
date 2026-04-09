"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주 내비게이션"
      className="fixed right-0 bottom-0 left-0 z-10 flex border-t border-border bg-background/80 backdrop-blur-sm md:hidden"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = isNavItemActive(pathname, href);
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
