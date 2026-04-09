"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button/Button";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

import { isNavItemActive, NAV_ITEMS } from "./nav-items";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    posthog.capture(POSTHOG_EVENTS.LOGOUT_CLICKED);
    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("로그아웃에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <Button
          asChild
          className="text-xl font-black tracking-tighter text-primary hover:bg-transparent"
          variant="ghost"
        >
          <Link href="/dashboard">201</Link>
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
                    <Link href={href}>{label}</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Tooltip label={isLoggingOut ? "로그아웃 중..." : "로그아웃"}>
        <Button
          aria-label={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          disabled={isLoggingOut}
          onClick={handleLogout}
          size="icon"
          variant="ghost"
        >
          <LogOutIcon aria-hidden="true" />
        </Button>
      </Tooltip>
    </header>
  );
}
