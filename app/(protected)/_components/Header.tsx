"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button/Button";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

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
      <span className="text-lg font-bold">201</span>
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
