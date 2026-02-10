import { Button } from "@/components/ui/button";
import { Star, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function FeaturedDoctors() {
  const { data: featuredDoctors = [], isLoading } = useQuery({
    queryKey: ["featured-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id, full_name, title, specializations, experience_years, rating, total_reviews,
          photo_url, consultation_fee, slug,
          doctor_hospitals (
            is_primary,
            hospitals (name)
          )
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .limit(4);

      if (error) throw error;
      return (data || []).map((doc) => {
        const primary = doc.doctor_hospitals?.find((dh: any) => dh.is_primary) || doc.doctor_hospitals?.[0];
        return {
          id: doc.id,
          slug: doc.slug || doc.id,
          name: doc.full_name,
          title: doc.title || doc.specializations?.join(", ") || "",
          specialty: doc.specializations?.[0] || "General",
          hospital: primary?.hospitals?.name || "",
          experience: doc.experience_years || 0,
          rating: doc.rating || 0,
          reviews: doc.total_reviews || 0,
          image: doc.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
          fee: doc.consultation_fee || 500,
        };
      });
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (featuredDoctors.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Our Experts
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Top Rated Doctors
            </h2>
          </div>
          <Link to="/doctors">
            <Button variant="outline" className="group">
              View All Doctors
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Doctors Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDoctors.map((doctor) => (
            <Link
              key={doctor.id}
              to={`/doctors/${doctor.slug}`}
              className="group overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {doctor.rating > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviews})</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-xs font-medium text-primary">{doctor.specialty}</div>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {doctor.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{doctor.title}</p>
                {doctor.hospital && (
                  <p className="mt-2 text-sm text-muted-foreground">{doctor.hospital}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Experience</span>
                    <p className="text-sm font-medium">{doctor.experience} Years</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Fee</span>
                    <p className="text-sm font-semibold text-primary">৳{doctor.fee}</p>
                  </div>
                </div>

                <Button variant="hero" size="sm" className="mt-4 w-full">
                  Book Appointment
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDoctors;
