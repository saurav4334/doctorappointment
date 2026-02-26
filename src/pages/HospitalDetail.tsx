import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2, MapPin, Phone, Mail, Globe, Clock, Shield,
  ChevronRight, Star, Stethoscope, Loader2, ArrowLeft, Users,
} from "lucide-react";

export default function HospitalDetail() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch hospital by slug or id
  const { data: hospital, isLoading: hospitalLoading } = useQuery({
    queryKey: ["hospital-detail", slug],
    queryFn: async () => {
      // Try slug first, then id
      let { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "approved")
        .maybeSingle();

      if (!data && slug) {
        const res = await supabase
          .from("hospitals")
          .select("*")
          .eq("id", slug)
          .eq("status", "approved")
          .maybeSingle();
        data = res.data;
        error = res.error;
      }
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch departments for this hospital
  const { data: departments = [] } = useQuery({
    queryKey: ["hospital-departments", hospital?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_departments")
        .select("department_id, departments(id, name, icon, image_url)")
        .eq("hospital_id", hospital!.id)
        .eq("is_active", true);
      return data?.map((hd: any) => hd.departments).filter(Boolean) || [];
    },
    enabled: !!hospital?.id,
  });

  // Fetch doctors for this hospital
  const { data: doctors = [] } = useQuery({
    queryKey: ["hospital-doctors", hospital?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("doctor_hospitals")
        .select(`
          doctor_id,
          department_id,
          departments(name),
          doctors(id, full_name, title, slug, photo_url, specializations, qualifications, experience_years, rating, total_reviews, consultation_fee)
        `)
        .eq("hospital_id", hospital!.id)
        .eq("is_active", true);
      return (
        data
          ?.map((dh: any) => ({
            ...dh.doctors,
            department_name: dh.departments?.name,
          }))
          .filter(Boolean) || []
      );
    },
    enabled: !!hospital?.id,
  });

  if (hospitalLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!hospital) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Building2 className="h-16 w-16 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold text-foreground">Hospital Not Found</h1>
          <p className="text-muted-foreground">The hospital you're looking for doesn't exist or isn't available.</p>
          <Button asChild>
            <Link to="/hospitals">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hospitals
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-muted/30">
        {/* Banner */}
        <section className="relative h-56 md:h-72 overflow-hidden bg-gradient-to-r from-primary to-secondary">
          {hospital.banner_url && (
            <img
              src={hospital.banner_url}
              alt={hospital.name}
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="container relative mx-auto flex h-full items-end px-4 pb-6">
            <div className="flex items-end gap-5">
              {hospital.logo_url ? (
                <img
                  src={hospital.logo_url}
                  alt={hospital.name}
                  className="h-20 w-20 rounded-xl border-4 border-background bg-background object-contain shadow-lg md:h-24 md:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-background bg-background shadow-lg md:h-24 md:w-24">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
              )}
              <div className="pb-1 text-background">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold md:text-3xl">{hospital.name}</h1>
                  <Badge variant="secondary" className="capitalize">{hospital.type || "Hospital"}</Badge>
                  {hospital.emergency_services && (
                    <Badge variant="destructive">
                      <Clock className="mr-1 h-3 w-3" /> 24/7 Emergency
                    </Badge>
                  )}
                </div>
                {(hospital.city || hospital.state) && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-background/80">
                    <MapPin className="h-3.5 w-3.5" />
                    {[hospital.address, hospital.city, hospital.state, hospital.postal_code].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Back link */}
          <Link to="/hospitals" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Hospitals
          </Link>

          <div className="mt-4 grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {hospital.description && (
                <section className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{hospital.description}</p>
                </section>
              )}

              {/* Facilities */}
              {hospital.facilities && hospital.facilities.length > 0 && (
                <section className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">
                    <Shield className="mr-2 inline h-5 w-5 text-primary" />
                    Facilities & Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {hospital.facilities.map((f: string, i: number) => (
                      <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm font-normal">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Departments */}
              {departments.length > 0 && (
                <section className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">
                    <Stethoscope className="mr-2 inline h-5 w-5 text-primary" />
                    Departments ({departments.length})
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {departments.map((dept: any) => (
                      <Link
                        key={dept.id}
                        to={`/departments/${dept.name?.toLowerCase().replace(/\s+/g, "-")}`}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        {dept.image_url ? (
                          <img src={dept.image_url} alt={dept.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Doctors */}
              {doctors.length > 0 && (
                <section className="rounded-xl border bg-card p-6">
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">
                    <Users className="mr-2 inline h-5 w-5 text-primary" />
                    Our Doctors ({doctors.length})
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {doctors.map((doc: any) => (
                      <Link
                        key={doc.id}
                        to={`/doctors/${doc.slug || doc.id}`}
                        className="flex items-start gap-4 rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        {doc.photo_url ? (
                          <img
                            src={doc.photo_url}
                            alt={doc.full_name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                            {doc.full_name?.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {doc.title} {doc.full_name}
                          </p>
                          {doc.department_name && (
                            <p className="text-xs text-primary font-medium">{doc.department_name}</p>
                          )}
                          {doc.specializations && doc.specializations.length > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                              {doc.specializations.slice(0, 2).join(", ")}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            {doc.experience_years > 0 && <span>{doc.experience_years}+ yrs exp</span>}
                            {doc.rating > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {Number(doc.rating).toFixed(1)}
                              </span>
                            )}
                            {doc.consultation_fee > 0 && <span>৳{doc.consultation_fee}</span>}
                          </div>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Contact info */}
            <aside className="space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {hospital.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Address</p>
                        <p className="text-sm text-foreground">
                          {[hospital.address, hospital.city, hospital.state, hospital.postal_code].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  {hospital.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <a href={`tel:${hospital.phone}`} className="text-sm text-foreground hover:text-primary">
                          {hospital.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {hospital.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <a href={`mailto:${hospital.email}`} className="text-sm text-foreground hover:text-primary">
                          {hospital.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {hospital.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Website</p>
                        <a
                          href={hospital.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground hover:text-primary"
                        >
                          {hospital.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}
                  {hospital.registration_number && (
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Registration No.</p>
                        <p className="text-sm text-foreground">{hospital.registration_number}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-5" />

                <Button className="w-full" asChild>
                  <Link to={`/doctors?hospital=${hospital.id}`}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Find & Book a Doctor
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-display text-sm font-bold text-foreground mb-3">At a Glance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{departments.length}</p>
                    <p className="text-xs text-muted-foreground">Departments</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{doctors.length}</p>
                    <p className="text-xs text-muted-foreground">Doctors</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}
