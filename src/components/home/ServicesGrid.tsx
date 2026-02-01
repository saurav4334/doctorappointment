import { 
  Stethoscope, 
  FlaskConical, 
  HeartPulse, 
  Pill,
  Baby,
  Eye,
  Brain,
  Bone
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Stethoscope,
    name: "General Medicine",
    description: "Comprehensive care for common health issues and preventive care.",
    link: "/departments/general-medicine",
  },
  {
    icon: HeartPulse,
    name: "Cardiology",
    description: "Expert heart care including diagnosis and treatment of heart diseases.",
    link: "/departments/cardiology",
  },
  {
    icon: Brain,
    name: "Neurology",
    description: "Specialized care for brain, spine, and nervous system conditions.",
    link: "/departments/neurology",
  },
  {
    icon: Bone,
    name: "Orthopedics",
    description: "Treatment for bones, joints, muscles, and sports injuries.",
    link: "/departments/orthopedics",
  },
  {
    icon: Baby,
    name: "Pediatrics",
    description: "Complete healthcare for infants, children, and adolescents.",
    link: "/departments/pediatrics",
  },
  {
    icon: Eye,
    name: "Ophthalmology",
    description: "Comprehensive eye care and vision correction services.",
    link: "/departments/ophthalmology",
  },
  {
    icon: FlaskConical,
    name: "Diagnostics",
    description: "Advanced lab tests and imaging for accurate diagnosis.",
    link: "/departments/diagnostics",
  },
  {
    icon: Pill,
    name: "Pharmacy",
    description: "Quality medicines with convenient delivery options.",
    link: "/departments/pharmacy",
  },
];

export function ServicesGrid() {
  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Services
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Comprehensive Healthcare Services
          </h2>
          <p className="mt-4 text-muted-foreground">
            From routine check-ups to specialized treatments, we offer a wide range of 
            medical services to meet all your healthcare needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Link
              key={service.name}
              to={service.link}
              className="group rounded-xl bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;
