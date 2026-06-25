import {
  HeroSection,
  SearchSection,
  FeaturesSection,
  MetricsSection,
  ReportsPreview,
  CTASection,
} from "@/components/landing";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <SearchSection />
        <FeaturesSection />
        <MetricsSection />
        <ReportsPreview />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}