import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Ambulance, MapPin, Phone, User, AlertTriangle, CheckCircle2 } from "lucide-react";

const ambulanceSchema = z.object({
  patient_name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  pickup_location: z.string().trim().min(1, "Pickup location is required").max(500),
  destination: z.string().trim().max(500).optional().or(z.literal("")),
  ambulance_type: z.enum(["basic", "advanced", "icu", "neonatal"]),
  emergency_level: z.enum(["normal", "urgent", "critical"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;

const AMBULANCE_TYPES = [
  { value: "basic", label: "Basic Ambulance", desc: "Standard patient transport with first-aid equipment" },
  { value: "advanced", label: "Advanced Life Support (ALS)", desc: "Equipped with cardiac monitors, defibrillators & medications" },
  { value: "icu", label: "ICU Ambulance", desc: "Mobile ICU with ventilator & critical care equipment" },
  { value: "neonatal", label: "Neonatal Ambulance", desc: "Specialized for newborn & infant emergency transport" },
];

export default function AmbulanceService() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      patient_name: "",
      phone: "",
      email: "",
      pickup_location: "",
      destination: "",
      ambulance_type: "basic",
      emergency_level: "normal",
      notes: "",
    },
  });

  const onSubmit = async (values: AmbulanceFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("ambulance_requests").insert({
        patient_name: values.patient_name,
        phone: values.phone,
        email: values.email || null,
        pickup_location: values.pickup_location,
        destination: values.destination || null,
        ambulance_type: values.ambulance_type,
        emergency_level: values.emergency_level,
        notes: values.notes || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Request Submitted", description: "Our team will contact you shortly." });
    } catch {
      toast({ title: "Error", description: "Failed to submit request. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
              <CheckCircle2 className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Request Submitted!</h2>
            <p className="mt-3 text-muted-foreground">
              Your ambulance request has been received. Our dispatch team will contact you at the provided phone number shortly.
            </p>
            <p className="mt-1 text-sm font-medium text-destructive">
              For life-threatening emergencies, please also call 999 immediately.
            </p>
            <Button className="mt-6" onClick={() => { setSubmitted(false); form.reset(); }}>
              Submit Another Request
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
            <Ambulance className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ambulance Service
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Request an ambulance quickly by filling out the form below. Our dispatch team will respond promptly.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>For life-threatening emergencies, call <strong>999</strong> immediately in addition to submitting this form.</span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient Info */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <User className="h-5 w-5 text-primary" /> Patient Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="patient_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="Patient name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl><Input placeholder="+880 1XXX XXXXXX" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl><Input placeholder="email@example.com" type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <MapPin className="h-5 w-5 text-primary" /> Location Details
                  </h3>
                  <FormField control={form.control} name="pickup_location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location *</FormLabel>
                      <FormControl><Input placeholder="Enter full address or landmark" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination (Optional)</FormLabel>
                      <FormControl><Input placeholder="Hospital or destination address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Ambulance Type */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Ambulance className="h-5 w-5 text-primary" /> Ambulance Type
                  </h3>
                  <FormField control={form.control} name="ambulance_type" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
                          {AMBULANCE_TYPES.map((type) => (
                            <label
                              key={type.value}
                              className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors ${
                                field.value === type.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={type.value} />
                                <span className="font-medium text-foreground">{type.label}</span>
                              </div>
                              <p className="mt-1 pl-6 text-xs text-muted-foreground">{type.desc}</p>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Emergency Level */}
                <FormField control={form.control} name="emergency_level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Level *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select emergency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal — Non-emergency transport</SelectItem>
                        <SelectItem value="urgent">Urgent — Needs prompt attention</SelectItem>
                        <SelectItem value="critical">Critical — Life-threatening emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Notes */}
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information about the patient's condition..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Request Ambulance"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
