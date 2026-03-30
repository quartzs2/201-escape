import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

import { PublicHeader } from "./_components/PublicHeader";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col justify-center px-5 pb-8">
        <p className="text-sm text-muted-foreground">채용 공고 관리</p>
        <h1 className="mt-0.5 text-3xl text-foreground">201 Escape</h1>
        <p className="mt-2 text-muted-foreground">
          개인 채용 공고 관리 대시보드
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
