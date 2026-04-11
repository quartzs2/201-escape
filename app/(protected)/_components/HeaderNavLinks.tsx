"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils/cn";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

export function HeaderNavLinks() {
  const pathname = usePathname();

  return (
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
              <Link aria-current={isActive ? "page" : undefined} href={href}>
                {label}
              </Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
