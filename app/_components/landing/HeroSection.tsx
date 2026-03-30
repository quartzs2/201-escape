export function HeroSection() {
  return (
    <section className="flex flex-col px-6 pt-20 pb-12">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-primary uppercase">
          채용 공고 관리 대시보드
        </span>
      </div>

      <h1
        className="mt-6 animate-fade-up text-[40px] leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl"
        style={{ animationDelay: "80ms" }}
      >
        취업 준비,
        <br />
        <span className="text-primary">체계적으로</span>
      </h1>

      <p
        className="mt-6 animate-fade-up text-lg leading-relaxed font-medium text-muted-foreground/80"
        style={{ animationDelay: "160ms" }}
      >
        지원 현황부터 일정 관리까지,
        <br />
        201 Escape로 한눈에 관리하세요.
      </p>
    </section>
  );
}
