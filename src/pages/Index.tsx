import Layout from "@/components/layout/Layout";
import HeroSlider from "@/components/home/HeroSlider";
import ServicesGrid from "@/components/home/ServicesGrid";
import QuickServicesSection from "@/components/home/QuickServicesSection";
import FeaturedDoctors from "@/components/home/FeaturedDoctors";
import PartnersSection from "@/components/home/PartnersSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSlider />
      <ServicesGrid />
      <QuickServicesSection />
      <FeaturedDoctors />
      <PartnersSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
