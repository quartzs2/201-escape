import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FeaturesSection } from "./_components/landing/FeaturesSection";
import { HeroSection } from "./_components/landing/HeroSection";
import { PublicHeader } from "./_components/PublicHeader";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <footer className="flex justify-center px-6 py-16">
        <Link
          className="group flex flex-col items-center gap-4 transition-transform active:scale-95"
          href="/login"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:bg-primary/90 group-hover:shadow-xl">
            <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            시작하기
          </span>
        </Link>
      </footer>
    </div>
  );
}
