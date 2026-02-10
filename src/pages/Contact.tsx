import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [page, setPage] = useState<{ title: string; content: string | null; excerpt: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [pageRes, settingsRes] = await Promise.all([
        supabase
          .from("cms_pages")
          .select("title, content, excerpt")
          .eq("slug", "contact-us")
          .eq("status", "published")
          .maybeSingle(),
        supabase.from("site_settings").select("setting_key, setting_value"),
      ]);
      setPage(pageRes.data);
      const settings: Record<string, string> = {};
      settingsRes.data?.forEach((s) => {
        if (s.setting_value) settings[s.setting_key] = s.setting_value;
      });
      setSiteSettings(settings);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll get back to you soon.");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {page?.title || "Contact Us"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {page?.excerpt || "Get in touch with us. We'd love to hear from you."}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
                {page?.content && (
                  <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{page.content}</p>
                )}
              </div>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "Phone", value: siteSettings.contact_phone || "+880 9678 123456" },
                  { icon: Mail, label: "Email", value: siteSettings.contact_email || "info@medicare.com" },
                  { icon: MapPin, label: "Address", value: siteSettings.contact_address || "Dhaka, Bangladesh" },
                  { icon: Clock, label: "Hours", value: "24/7 Emergency | Mon-Sat 8AM-10PM" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border bg-card p-6 md:p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="Your phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Write your message..." rows={5} required />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
