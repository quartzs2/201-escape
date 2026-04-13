const HERO_ANIMATION_DELAYS = {
  heading: "140ms",
  intro: "80ms",
  list: "380ms",
  summary: "220ms",
} as const;

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="animate-fade-up text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            201 escape
          </p>
          <p
            className="mt-4 animate-fade-up text-sm font-medium text-muted-foreground"
            style={{ animationDelay: HERO_ANIMATION_DELAYS.intro }}
          >
            공고, 지원 단계, 면접 일정을 한곳에서 정리합니다.
          </p>
          <h1
            className="mt-5 animate-fade-up text-[2.7rem] leading-[1.02] font-bold tracking-[-0.05em] text-balance text-foreground sm:text-[3.6rem] lg:text-[4.2rem]"
            style={{ animationDelay: HERO_ANIMATION_DELAYS.heading }}
          >
            지원 흐름을
            <br />더 쉽게 정리하세요.
          </h1>
          <p
            className="mt-6 max-w-xl animate-fade-up text-base leading-7 font-medium text-muted-foreground"
            style={{ animationDelay: HERO_ANIMATION_DELAYS.summary }}
          >
            <span className="block">
              저장한 공고와 현재 상태, 예정된 면접 일정을 한 화면에서 확인할 수
              있습니다.
            </span>
            <span className="block">
              처음 열어도 바로 이해할 수 있는 흐름에 집중했습니다.
            </span>
          </p>

          <ul
            className="mt-10 grid animate-fade-up gap-3 border-t border-border pt-6 text-sm font-medium text-muted-foreground sm:grid-cols-3"
            style={{ animationDelay: HERO_ANIMATION_DELAYS.list }}
          >
            <li>공고를 저장하고 단계별로 관리</li>
            <li>면접 일정과 메모를 함께 기록</li>
            <li>전체 진행 현황을 빠르게 확인</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
