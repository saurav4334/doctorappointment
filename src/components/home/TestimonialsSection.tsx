import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, patient_name, content, rating, patient_photo_url, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto mt-2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonials
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            What Our Patients Say
          </h2>
          <p className="mt-4 text-muted-foreground">
            Don't just take our word for it. Here's what our patients have to say
            about their experience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-xl bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="absolute -top-3 left-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Quote className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="mt-4 text-muted-foreground">
                  "{testimonial.content}"
                </p>

                <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  {testimonial.patient_photo_url ? (
                    <img
                      src={testimonial.patient_photo_url}
                      alt={testimonial.patient_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {testimonial.patient_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.patient_name}</h4>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
