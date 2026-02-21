import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import HomeSection from "@/components/HomeSection";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <main>
      <HomeSection />
      <PricingSection />
      <ContactSection />
      <AboutSection />
    </main>
  );
}
