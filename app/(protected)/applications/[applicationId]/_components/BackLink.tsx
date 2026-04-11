import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";

export function BackLink() {
  return (
    <Tooltip label="지원 목록으로 돌아가기" side="bottom">
      <Button
        asChild
        className="-ml-2 text-muted-foreground hover:text-foreground"
        size="sm"
        variant="ghost"
      >
        <Link aria-label="지원 목록으로 돌아가기" href="/applications">
          <ArrowLeftIcon aria-hidden="true" />
        </Link>
      </Button>
    </Tooltip>
  );
}
