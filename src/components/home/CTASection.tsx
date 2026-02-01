import { Button } from "@/components/ui/button";
import { Phone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 lg:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <div className="text-primary-foreground">
              <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Ready to Book Your Appointment?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Find the right doctor, book an appointment, and receive quality healthcare 
                without the hassle. Your health is our priority.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to="/doctors">
                  <Button variant="heroOutline" size="lg" className="w-full sm:w-auto group">
                    Book Appointment
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="tel:+8809678123456">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                  >
                    <Phone className="h-5 w-5" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Hospital registration CTA */}
            <div className="rounded-xl bg-primary-foreground/10 p-6 backdrop-blur-sm lg:p-8">
              <h3 className="font-display text-xl font-semibold text-primary-foreground md:text-2xl">
                Are You a Hospital or Clinic?
              </h3>
              <p className="mt-2 text-primary-foreground/80">
                Join our growing network of healthcare providers. Register your hospital 
                and reach thousands of patients looking for quality healthcare.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  Increase patient appointments
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  Easy schedule management
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  Digital presence for your hospital
                </li>
              </ul>
              <Link to="/hospital-register" className="mt-6 block">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full"
                >
                  Register Your Hospital
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
