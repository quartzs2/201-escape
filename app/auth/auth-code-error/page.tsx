import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

import { PublicHeader } from "../../_components/PublicHeader";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex h-dvh flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col justify-center px-5 pb-8">
        <p className="text-sm text-muted-foreground">오류</p>
        <h1 className="mt-0.5 text-3xl text-foreground">인증 오류</h1>
        <p className="mt-2 text-muted-foreground">
          인증 코드가 유효하지 않거나 만료되었습니다.
          <br />
          다시 로그인을 시도해 주세요.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/login">로그인 페이지로 돌아가기</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/">메인 화면으로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
