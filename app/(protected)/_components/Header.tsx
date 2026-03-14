"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button/Button";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="text-lg font-bold">201</span>
      <Button onClick={handleLogout} size="sm" variant="ghost">
        <LogOut />
        로그아웃
      </Button>
    </header>
  );
}
