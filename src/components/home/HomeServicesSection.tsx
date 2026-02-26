import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Home, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function HomeServicesSection() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["home-services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("home_services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("home_service_requests").insert({
      service_id: selectedService?.id,
      patient_name: form.get("patient_name") as string,
      phone: form.get("phone") as string,
      email: (form.get("email") as string) || null,
      address: form.get("address") as string,
      preferred_date: (form.get("preferred_date") as string) || null,
      preferred_time: (form.get("preferred_time") as string) || null,
      notes: (form.get("notes") as string) || null,
    });

    setIsSubmitting(false);
    if (error) {
      toast.error("Failed to submit request. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Your home service request has been submitted!");
    }
  };

  const closeDialog = () => {
    setSelectedService(null);
    setSubmitted(false);
  };

  if (services.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Home Services
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Get quality healthcare services at your doorstep — convenient, safe, and professional.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 max-w-5xl mx-auto">
          {services.map((service: any) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Home className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-primary transition-colors group-hover:text-primary/80 md:text-base">
                {service.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={!!selectedService} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <h3 className="text-xl font-bold text-foreground">Request Submitted!</h3>
              <p className="text-muted-foreground">
                We'll get back to you shortly regarding your{" "}
                <strong>{selectedService?.name}</strong> request.
              </p>
              <Button onClick={closeDialog}>Close</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Request: {selectedService?.name}</DialogTitle>
                <DialogDescription>
                  {selectedService?.description || "Fill in your details and we'll arrange the service for you."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="patient_name">Full Name *</Label>
                    <Input id="patient_name" name="patient_name" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="preferred_date">Preferred Date</Label>
                    <Input id="preferred_date" name="preferred_date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="preferred_time">Preferred Time</Label>
                    <Input id="preferred_time" name="preferred_time" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
