import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80",
    title: "Healthcare Anytime, Anywhere",
    subtitle: "Let us take care of your health",
    cta: "Explore Our Services",
    ctaLink: "/doctors",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&q=80",
    title: "Consult With Experienced Doctors",
    subtitle: "Our doctors spend time to get to know you and your health. They treat you with the respect and empathy you deserve.",
    cta: "Book Appointment",
    ctaLink: "/doctors",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&q=80",
    title: "Affordable Health Packages",
    subtitle: "Health checks and packages tailored to your needs, based on age and gender, that fit within your budget.",
    cta: "View Packages",
    ctaLink: "/packages",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative h-[600px] overflow-hidden md:h-[700px] lg:h-[85vh]">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          </div>

          {/* Content */}
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
              <p 
                className={`mt-4 text-lg text-background/90 md:mt-6 md:text-xl ${
                  index === currentSlide ? "animate-fade-up" : ""
                }`}
                style={{ animationDelay: "0.4s" }}
              >
                {slide.subtitle}
              </p>
              <div 
                className={`mt-6 md:mt-8 ${index === currentSlide ? "animate-fade-up" : ""}`}
                style={{ animationDelay: "0.6s" }}
              >
                <Link to={slide.ctaLink}>
                  <Button variant="hero" size="xl" className="group">
                    {slide.cta}
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
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

      {/* Dots Indicator */}
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
    </section>
  );
}

export default HeroSlider;
