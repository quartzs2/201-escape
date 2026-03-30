import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

export function PublicHeader() {
  return (
    <header className="border-b border-border px-6 py-3">
      <Button
        asChild
        className="text-lg font-bold hover:bg-transparent"
        variant="ghost"
      >
        <Link href="/">201</Link>
      </Button>
    </header>
  );
}
