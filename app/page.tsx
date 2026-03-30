import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FeaturesSection } from "./_components/landing/FeaturesSection";
import { HeroSection } from "./_components/landing/HeroSection";
import { PublicHeader } from "./_components/PublicHeader";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <footer className="flex justify-center px-6 py-10">
        <Link className="flex flex-col items-center gap-2" href="/login">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </span>
          <span className="text-sm text-muted-foreground">시작하기</span>
        </Link>
      </footer>
    </div>
  );
}
