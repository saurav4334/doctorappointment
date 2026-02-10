import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Stethoscope, HeartPulse, Brain, Bone, Baby, Eye, FlaskConical, Pill,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  heartpulse: HeartPulse,
  brain: Brain,
  bone: Bone,
  baby: Baby,
  eye: Eye,
  flaskconical: FlaskConical,
  pill: Pill,
};

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Stethoscope;
  return ICON_MAP[iconName.toLowerCase()] || Stethoscope;
}

export function ServicesGrid() {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["homepage-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, description, icon")
        .eq("is_active", true)
        .order("name")
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
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

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept, index) => {
              const Icon = getIcon(dept.icon);
              return (
                <Link
                  key={dept.id}
                  to={`/departments/${dept.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group rounded-xl bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {dept.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {dept.description || "Specialized medical care and treatment."}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {departments.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View All Departments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesGrid;
