import { FeaturesSection } from "./_components/landing/FeaturesSection";
import { FinalCtaSection } from "./_components/landing/FinalCtaSection";
import { HeroSection } from "./_components/landing/HeroSection";
import { PublicHeader } from "./_components/PublicHeader";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FinalCtaSection />
      </main>
    </div>
  );
}
