import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function PartnersSection() {
  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["partner-hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospitals")
        .select("id, name, logo_url")
        .eq("status", "approved")
        .not("logo_url", "is", null)
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (hospitals.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Corporate Clients & Partners
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="group flex items-center justify-center grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
            >
              <img
                src={hospital.logo_url!}
                alt={hospital.name}
                className="h-10 md:h-12 w-auto max-w-[140px] object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnersSection;
