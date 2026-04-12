import { landingFeatures } from "./utils/content";

export function FeaturesSection() {
  return (
    <section
      className="border-t border-black/6 bg-white py-16 text-[#192016] lg:py-18"
      id="features"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.24em] text-[#667064] uppercase">
            기능
          </p>
          <h2 className="mt-4 text-[2rem] leading-[1.08] font-black tracking-[-0.05em] text-balance sm:text-[2.6rem]">
            필요한 기능만 간단하게 담았습니다.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5f675c]">
            공고, 일정, 현황처럼 자주 보는 정보만 담았습니다.
          </p>
        </header>

        <ul className="mt-10 grid gap-8 border-t border-black/6 pt-8 md:grid-cols-3">
          {landingFeatures.map(({ description, icon: Icon, title }) => (
            <li key={title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f1] text-[#364133]">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-[#192016]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5f675c]">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
