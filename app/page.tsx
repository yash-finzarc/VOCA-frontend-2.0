import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrustedBySection } from "@/components/trusted-by-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { ArchitectureSection } from "@/components/architecture-section"
import { ComparisonSection } from "@/components/comparison-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TrustedBySection />
        <HowItWorksSection />
        <FeaturesSection />
        <ArchitectureSection />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
