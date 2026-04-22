export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            201 escape
          </p>
          <h1 className="mt-5 text-[2.7rem] leading-[1.02] font-bold tracking-[-0.05em] text-balance text-foreground sm:text-[3.6rem] lg:text-[4.2rem]">
            흩어진 채용 공고를
            <br />한 곳에서.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 font-medium text-muted-foreground">
            <span className="block">
              저장한 공고와 현재 상태, 예정된 면접 일정을 <br />한 곳에
              정리하세요.
            </span>
          </p>

          <ul className="mt-10 grid gap-3 border-t border-border pt-6 text-sm font-medium text-muted-foreground sm:grid-cols-3">
            <li>공고를 저장하고 단계별로 관리</li>
            <li>면접 일정과 메모를 함께 기록</li>
            <li>전체 진행 현황을 빠르게 확인</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
