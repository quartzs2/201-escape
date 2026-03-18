"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button/Button";
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
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="text-lg font-bold">201</span>
      <Button
        disabled={isLoggingOut}
        onClick={handleLogout}
        size="sm"
        variant="ghost"
      >
        <LogOutIcon aria-hidden="true" />
        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
      </Button>
    </header>
  );
}
