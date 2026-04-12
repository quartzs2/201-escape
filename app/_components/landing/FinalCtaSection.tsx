import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button/Button";

export function FinalCtaSection() {
  return (
    <section className="border-t border-[#40513b]/10 bg-white py-16 text-[#192016] lg:py-18">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.24em] text-[#40513b]/70 uppercase">
            시작하기
          </p>
          <h2 className="mt-4 text-[2rem] leading-[1.08] font-black tracking-[-0.05em] text-balance sm:text-[2.6rem]">
            흩어진 지원 기록을 한곳에 모아보세요.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#4f594b]">
            지금 바로 로그인해서 공고와 일정을 정리할 수 있습니다.
          </p>
        </div>

        <Button
          asChild
          className="h-[3.25rem] w-full rounded-full bg-[#40513b] px-7 text-sm font-bold text-white hover:bg-[#354230] focus-visible:ring-[#40513b] sm:w-auto"
        >
          <a href="/login">
            로그인하고 시작하기
            <ArrowRightIcon className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
