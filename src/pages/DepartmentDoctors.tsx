import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Star, MapPin, Clock, ChevronRight } from "lucide-react";

export default function DepartmentDoctorsPage() {
  const { slug } = useParams();

  // Resolve department by slug
  const { data: department, isLoading: deptLoading } = useQuery({
    queryKey: ["department-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, description, icon, image_url")
        .eq("is_active", true);
      if (error) throw error;
      // Match by slugified name
      const match = data?.find(
        (d) => d.name.toLowerCase().replace(/\s+/g, "-") === slug
      );
      if (!match) throw new Error("Department not found");
      return match;
    },
    enabled: !!slug,
  });

  // Fetch doctors in this department
  const { data: doctors = [], isLoading: docsLoading } = useQuery({
    queryKey: ["department-doctors", department?.id],
    queryFn: async () => {
      // Get doctor IDs assigned to this department
      const { data: assignments, error: aErr } = await supabase
        .from("doctor_hospitals")
        .select("doctor_id, hospital_id, is_primary, hospitals(name, city)")
        .eq("department_id", department!.id)
        .eq("is_active", true);
      if (aErr) throw aErr;
      if (!assignments || assignments.length === 0) return [];

      const doctorIds = [...new Set(assignments.map((a) => a.doctor_id))];

      const { data: docs, error: dErr } = await supabase
        .from("doctors")
        .select("id, full_name, title, specializations, experience_years, rating, total_reviews, photo_url, consultation_fee, slug")
        .eq("is_active", true)
        .in("id", doctorIds)
        .order("rating", { ascending: false });
      if (dErr) throw dErr;

      return (docs || []).map((doc) => {
        const assignment = assignments.find((a) => a.doctor_id === doc.id && a.is_primary) ||
          assignments.find((a) => a.doctor_id === doc.id);
        return {
          ...doc,
          hospital: (assignment?.hospitals as any)?.name || "",
          location: (assignment?.hospitals as any)?.city || "",
        };
      });
    },
    enabled: !!department?.id,
  });

  const isLoading = deptLoading || docsLoading;

  if (deptLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!department) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Department Not Found</h1>
          <p className="mt-2 text-muted-foreground">The department you're looking for doesn't exist.</p>
          <Link to="/departments">
            <Button className="mt-6">Browse All Departments</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/departments" className="hover:text-primary">Departments</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{department.name}</span>
          </div>
        </div>
      </div>

      {/* Department Header */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {department.name}
          </h1>
          {department.description && (
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{department.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {docsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No doctors available in this department yet.</p>
              <Link to="/doctors">
                <Button variant="outline" className="mt-4">Browse All Doctors</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={doctor.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80"}
                        alt={doctor.full_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-primary">
                            {doctor.specializations?.[0] || department.name}
                          </span>
                          <h3 className="font-display text-lg font-semibold text-foreground">
                            {doctor.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.title || doctor.specializations?.join(", ") || ""}
                          </p>
                        </div>
                        {(doctor.rating ?? 0) > 0 && (
                          <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-amber-700">{doctor.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        {doctor.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {doctor.location}
                          </span>
                        )}
                      </div>
                      {doctor.hospital && (
                        <p className="mt-1 text-sm text-muted-foreground">{doctor.hospital}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {doctor.experience_years || 0} yrs exp
                      </span>
                      <span className="font-semibold text-primary">৳{doctor.consultation_fee || 500}</span>
                    </div>
                    <Link to={`/doctors/${doctor.slug || doctor.id}`}>
                      <Button variant="hero" size="sm">Book Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
