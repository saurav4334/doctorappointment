import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Stethoscope, HeartPulse, Brain, Bone, Baby, Eye, FlaskConical, Pill,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        .select("id, name, description, icon, image_url")
        .eq("is_active", true)
        .order("name")
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Departments
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            Specialized Medical Care
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-10">
            {departments.map((dept) => {
              const Icon = getIcon(dept.icon);
              return (
                <Link
                  key={dept.id}
                  to={`/departments/${dept.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg">
                    {dept.image_url ? (
                      <img
                        src={dept.image_url}
                        alt={dept.name}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
                      />
                    ) : (
                      <Icon className="h-8 w-8 md:h-10 md:w-10" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors max-w-[100px]">
                    {dept.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {departments.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/departments">
              <Button variant="outline" size="sm" className="group">
                View All
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesGrid;
