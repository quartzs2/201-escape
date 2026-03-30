export function HeroSection() {
  return (
    <section className="flex flex-col px-6 pt-12">
      <span className="inline-flex w-fit animate-fade-up items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs text-primary">
        채용 공고 관리 대시보드
      </span>

      <h1
        className="mt-4 animate-fade-up text-4xl leading-tight font-bold tracking-tight text-foreground"
        style={{ animationDelay: "80ms" }}
      >
        취업 준비,
        <br />
        체계적으로
      </h1>

      <p
        className="mt-3 animate-fade-up text-base leading-relaxed text-muted-foreground"
        style={{ animationDelay: "160ms" }}
      >
        지원 현황부터 일정 관리까지,
        <br />
        201 Escape로 한눈에
      </p>
    </section>
  );
}
