import Layout from "@/components/layout/Layout";
import HeroSlider from "@/components/home/HeroSlider";
import ServicesGrid from "@/components/home/ServicesGrid";
import FeaturedDoctors from "@/components/home/FeaturedDoctors";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSlider />
      <ServicesGrid />
      <FeaturedDoctors />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
