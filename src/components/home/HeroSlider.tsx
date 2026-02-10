import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackSlides = [
  {
    id: "1",
    image_url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80",
    title: "Healthcare Anytime, Anywhere",
    subtitle: "Let us take care of your health",
    cta_text: "Explore Our Services",
    cta_link: "/doctors",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides = fallbackSlides } = useQuery({
    queryKey: ["cms-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_hero_slides")
        .select("id, title, subtitle, image_url, cta_text, cta_link")
        .eq("is_active", true)
        .order("sort_order");
      if (error || !data || data.length === 0) return fallbackSlides;
      return data;
    },
  });

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative h-[600px] overflow-hidden md:h-[700px] lg:h-[85vh]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          </div>

          <div className="container relative mx-auto flex h-full items-center px-4">
            <div className="max-w-2xl text-background">
              <h1
                className={`font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl ${
                  index === currentSlide ? "animate-fade-up" : ""
                }`}
                style={{ animationDelay: "0.2s" }}
              >
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p
                  className={`mt-4 text-lg text-background/90 md:mt-6 md:text-xl ${
                    index === currentSlide ? "animate-fade-up" : ""
                  }`}
                  style={{ animationDelay: "0.4s" }}
                >
                  {slide.subtitle}
                </p>
              )}
              {slide.cta_text && slide.cta_link && (
                <div
                  className={`mt-6 md:mt-8 ${index === currentSlide ? "animate-fade-up" : ""}`}
                  style={{ animationDelay: "0.6s" }}
                >
                  <Link to={slide.cta_link}>
                    <Button variant="hero" size="xl" className="group">
                      {slide.cta_text}
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/20 p-3 text-background backdrop-blur-sm transition-all hover:bg-background/40"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/20 p-3 text-background backdrop-blur-sm transition-all hover:bg-background/40"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-background/50 hover:bg-background/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default HeroSlider;
