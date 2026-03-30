import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";

export function BackLink() {
  return (
    <Tooltip label="대시보드로 돌아가기" side="bottom">
      <Button
        asChild
        className="-ml-2 text-muted-foreground hover:text-foreground"
        size="sm"
        variant="ghost"
      >
        <Link aria-label="대시보드로 돌아가기" href="/dashboard">
          <ArrowLeftIcon aria-hidden="true" />
        </Link>
      </Button>
    </Tooltip>
  );
}
