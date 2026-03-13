import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

export function BackLink() {
  return (
    <Button
      asChild
      className="h-auto w-fit px-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
      variant="ghost"
    >
      <Link href="/dashboard">
        <ArrowLeftIcon aria-hidden="true" />
        대시보드로 돌아가기
      </Link>
    </Button>
  );
}
