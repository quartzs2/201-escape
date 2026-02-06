import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">인증 오류</h1>
        <p className="flex flex-col text-gray-600">
          <span>인증 코드가 유효하지 않거나 만료되었습니다.</span>
          <span>다시 로그인을 시도해 주세요.</span>
        </p>
        <div className="pt-4">
          <Link
            href={ROUTES.LOGIN}
            className="inline-block rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
        <div>
          <Link
            href={ROUTES.HOME}
            className="text-sm text-gray-500 hover:underline"
          >
            메인 화면으로
          </Link>
        </div>
      </div>
    </div>
  );
}
