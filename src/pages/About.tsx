import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Loader2, Heart, Users, Award, Clock } from "lucide-react";

export default function About() {
  const [page, setPage] = useState<{ title: string; content: string | null; excerpt: string | null; featured_image_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      const { data } = await supabase
        .from("cms_pages")
        .select("title, content, excerpt, featured_image_url")
        .eq("slug", "about-us")
        .eq("status", "published")
        .maybeSingle();
      setPage(data);
      setLoading(false);
    };
    fetchPage();
  }, []);

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
            {page?.title || "About Us"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {page?.excerpt || "Dedicated to providing exceptional healthcare services to our community."}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: "Patients Served", value: "50,000+" },
              { icon: Heart, label: "Expert Doctors", value: "200+" },
              { icon: Award, label: "Years Experience", value: "15+" },
              { icon: Clock, label: "Available", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <stat.icon className="h-8 w-8 text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {page?.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img src={page.featured_image_url} alt={page.title} className="w-full h-64 md:h-96 object-cover" />
            </div>
          )}
          {page?.content ? (
            <div className="prose prose-lg max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {page.content}
            </div>
          ) : (
            <div className="space-y-6 text-foreground/90 leading-relaxed">
              <p>
                MediCare is a leading healthcare platform committed to making quality healthcare accessible to everyone. 
                Our mission is to connect patients with the best doctors and hospitals, ensuring timely and effective medical care.
              </p>
              <p>
                Founded with the vision of transforming healthcare delivery, we leverage technology to simplify appointment booking, 
                provide comprehensive health information, and ensure seamless communication between patients and healthcare providers.
              </p>
              <p>
                Our network includes top hospitals and experienced doctors across multiple specialties, 
                ensuring that you receive the best possible care for your health needs.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
