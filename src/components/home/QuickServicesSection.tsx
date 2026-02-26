import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Building2, Ambulance, Stethoscope } from "lucide-react";

const services = [
  {
    icon: CalendarCheck,
    title: "Doctor Appointment",
    description: "Search Doctor by Specializations",
    cta: "Book Appointment",
    link: "/doctors",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "Hospital Around You",
    description: "Search Hospital Near You",
    cta: "Search Hospital",
    link: "/departments",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Stethoscope,
    title: "Diagnostic Near You",
    description: "Search Diagnostic by Area",
    cta: "Search Diagnostic",
    link: "/departments",
    color: "bg-accent-foreground/10 text-accent-foreground",
  },
  {
    icon: Ambulance,
    title: "Ambulance Service",
    description: "Get Ambulance Near You",
    cta: "Get Ambulance",
    link: "/ambulance",
    color: "bg-destructive/10 text-destructive",
  },
];

export function QuickServicesSection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Simplifying healthcare for you and your family
          </h2>
          <p className="mt-4 text-muted-foreground">
            Finding the right doctor and the right treatment option has never been easier. 
            Discover our comprehensive suite of healthcare services designed to meet all your needs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-border/50"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${service.color} transition-transform group-hover:scale-110`}>
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {service.description}
              </p>
              <Link to={service.link} className="mt-4 block">
                <Button variant="default" size="sm" className="w-full">
                  {service.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuickServicesSection;
