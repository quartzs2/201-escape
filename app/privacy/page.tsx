import type { Metadata } from "next";

import Link from "next/link";

import { PublicHeader } from "../_components/PublicHeader";

export const metadata: Metadata = {
  description: "201 escape 개인정보처리방침",
  title: "개인정보처리방침 | 201 escape",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <PublicHeader />
      <main className="px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-border/60 bg-background p-6 shadow-xl shadow-black/[0.03] sm:p-10">
          <header className="border-b border-border/60 pb-6">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              Privacy Policy
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              개인정보처리방침
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              201 escape(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요하게
              생각하며, 관련 법령을 준수하기 위해 개인정보의 수집, 이용, 보관,
              파기 기준을 아래와 같이 안내합니다.
            </p>
            <dl className="mt-6 grid gap-3 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-foreground">시행일</dt>
                <dd className="mt-1 text-muted-foreground">2026년 4월 11일</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">문의 이메일</dt>
                <dd className="mt-1">
                  <a
                    className="font-medium text-primary underline underline-offset-4"
                    href="mailto:csh001231@gmail.com"
                  >
                    csh001231@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </header>

          <div className="mt-8 space-y-8 text-sm leading-7 text-foreground sm:text-[15px]">
            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                1. 수집하는 개인정보 항목
              </h2>
              <p className="mt-3 text-muted-foreground">
                서비스는 로그인, 채용 관리 기능 제공, 고객 문의 대응을 위해
                다음과 같은 정보를 수집할 수 있습니다.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>구글 로그인 시 제공되는 식별 정보(이름, 이메일 주소 등)</li>
                <li>이용자가 직접 입력한 채용 지원 정보 및 메모</li>
                <li>
                  서비스 이용 과정에서 생성되는 접속 기록, 기기 정보, 이용 로그
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                2. 개인정보의 수집 및 이용 목적
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>회원 식별, 로그인 및 사용자 인증</li>
                <li>채용 지원 현황 저장, 조회, 수정 등 핵심 기능 제공</li>
                <li>서비스 안정성 확보, 오류 분석, 부정 이용 방지</li>
                <li>문의 사항 확인 및 답변</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                3. 개인정보의 보관 및 이용 기간
              </h2>
              <p className="mt-3 text-muted-foreground">
                개인정보는 수집 및 이용 목적이 달성될 때까지 보관합니다.
                이용자가 회원 탈퇴를 요청하거나 개인정보 삭제가 필요한 경우,
                관련 법령에 따라 보관이 필요한 정보를 제외하고 지체 없이
                파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                4. 개인정보의 제3자 제공
              </h2>
              <p className="mt-3 text-muted-foreground">
                서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지
                않습니다. 다만, 법령에 근거가 있거나 이용자의 별도 동의가 있는
                경우에 한해 제공할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                5. 개인정보 처리의 위탁
              </h2>
              <p className="mt-3 text-muted-foreground">
                서비스 운영을 위해 필요한 범위 내에서 외부 서비스를 사용할 수
                있으며, 이 경우 관련 법령에 따라 안전하게 관리되도록 조치합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                6. 이용자의 권리와 행사 방법
              </h2>
              <p className="mt-3 text-muted-foreground">
                이용자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제,
                처리정지를 요청할 수 있습니다. 관련 요청은 아래 문의처로 접수할
                수 있으며, 서비스는 합리적인 기간 내에 필요한 조치를 진행합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                7. 개인정보의 파기 절차 및 방법
              </h2>
              <p className="mt-3 text-muted-foreground">
                개인정보 보관 기간이 종료되거나 처리 목적이 달성된 경우, 전자적
                파일은 복구가 어렵도록 삭제하고 종이 문서는 분쇄 또는 소각하는
                방식으로 파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                8. 개인정보 보호를 위한 안전성 확보 조치
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                <li>접근 권한 관리 및 인증 절차 운영</li>
                <li>개인정보 접근 최소화</li>
                <li>보안 업데이트 및 장애 모니터링</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">
                9. 개인정보처리방침의 변경
              </h2>
              <p className="mt-3 text-muted-foreground">
                본 방침은 법령, 서비스 내용, 운영 정책 변경에 따라 수정될 수
                있습니다. 중요한 변경이 있는 경우 서비스 내 공지 또는 별도
                안내를 통해 고지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold sm:text-xl">10. 문의처</h2>
              <p className="mt-3 text-muted-foreground">
                개인정보 처리와 관련한 문의는 아래 이메일로 연락해 주세요.
              </p>
              <a
                className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-semibold text-primary transition-colors hover:bg-primary/15"
                href="mailto:csh001231@gmail.com"
              >
                csh001231@gmail.com
              </a>
            </section>
          </div>

          <footer className="mt-10 border-t border-border/60 pt-6">
            <Link
              className="text-sm font-medium text-primary underline underline-offset-4"
              href="/"
            >
              홈으로 돌아가기
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
