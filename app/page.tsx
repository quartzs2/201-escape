import Link from "next/link";

import { Button } from "@/components/ui/button/Button";

export default function Home() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-4">
      <h1 className="flex flex-col text-4xl font-light">
        <span>201</span>
        <span>Escape</span>
      </h1>
      <p>개인 채용 공고 관리 대시보드</p>
      <Button asChild size={"lg"}>
        <Link href="/login">로그인</Link>
      </Button>
    </div>
  );
}
