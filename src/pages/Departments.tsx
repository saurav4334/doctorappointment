import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2, Users, ArrowRight } from "lucide-react";
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

interface DeptWithCount {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  doctorCount: number;
}

export default function DepartmentsPage() {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["public-departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, description, icon, image_url")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      // Fetch doctor counts per department
      const { data: assignments } = await supabase
        .from("doctor_hospitals")
        .select("department_id")
        .eq("is_active", true);

      const countMap: Record<string, number> = {};
      assignments?.forEach((a) => {
        if (a.department_id) countMap[a.department_id] = (countMap[a.department_id] || 0) + 1;
      });

      return (data || []).map((d) => ({
        ...d,
        doctorCount: countMap[d.id] || 0,
      })) as DeptWithCount[];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Our Medical Departments
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse our specialized departments to find the right doctor for your healthcare needs.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : departments.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No departments available yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {departments.map((dept) => {
                const Icon = getIcon(dept.icon);
                return (
                  <Link
                    key={dept.id}
                    to={`/departments/${encodeURIComponent(dept.name.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      {dept.name}
                    </h3>
                    {dept.description && (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {dept.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {dept.doctorCount} Doctor{dept.doctorCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-primary">
                        View Doctors <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
