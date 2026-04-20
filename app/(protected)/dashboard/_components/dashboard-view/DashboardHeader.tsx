import { formatKoreanDate } from "@/lib/utils";

export function DashboardHeader() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-3">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {formatKoreanDate(new Date())}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              지원 대시보드
            </h1>
            <p className="max-w-2xl text-sm leading-6 font-medium text-muted-foreground">
              <span className="block break-keep">
                전체 파이프라인 규모, 최근 12개월 지원 추이,
              </span>
              <span className="block break-keep">
                단계별 전환 흐름을 한 화면에서 확인합니다.
              </span>
            </p>
          </div>
        </header>
      </div>
    </section>
  );
}
