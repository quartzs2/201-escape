import {
  BarChart2,
  Briefcase,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  description: string;
  icon: LucideIcon;
  title: string;
};

const features: Feature[] = [
  {
    description:
      "지원한 모든 공고를 상태별로 정리. 서류·면접·최종 단계를 한 곳에서 관리하세요.",
    icon: Briefcase,
    title: "공고 한눈에",
  },
  {
    description:
      "면접 라운드별 정보를 기록하고 추적. 어떤 단계까지 진행됐는지 놓치지 않아요.",
    icon: CalendarDays,
    title: "면접 정보 기록",
  },
  {
    description:
      "전체·서류·면접·합격 건수를 대시보드에서 바로 확인. 내 지원 흐름을 파악하세요.",
    icon: BarChart2,
    title: "지원 현황 통계",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-6 py-16" id="features">
      <header>
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Features
        </span>
        <h2 className="mt-1.5 text-2xl font-bold text-foreground">
          필요한 기능만,
          <br />
          군더더기 없이
        </h2>
      </header>

      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {features.map(({ description, icon: Icon, title }) => (
          <li
            className="rounded-2xl border border-border bg-background p-5"
            key={title}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
