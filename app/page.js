import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import FeaturesSection from "@/components/FeaturesSection";
import FooterSection from "@/components/FooterSection";
import HomeSection from "@/components/HomeSection";
import PricingSection from "@/components/PricingSection";
import ProcessSection from "@/components/ProcessSection";

export default function Home() {
  return (
    <main>
      <HomeSection />
      <FeaturesSection />
      <ProcessSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <AboutSection />
      <FooterSection />
    </main>
  );
}
