import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, CheckCircle2 } from "lucide-react";

const HOSPITAL_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostic", label: "Diagnostic Center" },
  { value: "specialized", label: "Specialized Hospital" },
];

export default function HospitalRegister() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "hospital",
    description: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    email: "",
    website: "",
    emergency_services: false,
    facilities: "",
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in the hospital name, phone, and email.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("hospitals").insert([
      {
        name: form.name.trim(),
        slug,
        type: form.type,
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim() || null,
        emergency_services: form.emergency_services,
        facilities: form.facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        status: "pending",
      },
    ]);

    setSaving(false);

    if (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
          <Card className="max-w-lg w-full text-center">
            <CardContent className="py-12">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground">
                Thank you for registering your hospital. Our team will review your
                application and get back to you shortly via email.
              </p>
              <Button className="mt-6" asChild>
                <a href="/hospitals">Browse Hospitals</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-muted/30">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-secondary py-10 md:py-14">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="h-10 w-10 mx-auto text-primary-foreground/80 mb-3" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
              Register Your Hospital
            </h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Join our healthcare network and connect with patients across Bangladesh
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-2xl -mt-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>
                Fill in your hospital details. All submissions are reviewed before approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hospital Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Enter hospital name"
                      required
                      maxLength={150}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => update("type", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSPITAL_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Brief description of your hospital..."
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Street address"
                    maxLength={300}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="City"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State / Division</Label>
                    <Input
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="Division"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={form.postal_code}
                      onChange={(e) => update("postal_code", e.target.value)}
                      placeholder="Postal code"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+880..."
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="hospital@example.com"
                      required
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://..."
                    maxLength={300}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Facilities (comma-separated)</Label>
                  <Input
                    value={form.facilities}
                    onChange={(e) => update("facilities", e.target.value)}
                    placeholder="ICU, Emergency, Pharmacy, Parking, etc."
                    maxLength={500}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.emergency_services}
                    onCheckedChange={(v) => update("emergency_services", v)}
                  />
                  <Label>We offer 24/7 Emergency Services</Label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Registration
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
