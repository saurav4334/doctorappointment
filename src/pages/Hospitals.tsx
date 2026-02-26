import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin, Phone, Globe, Building2, Search, Loader2,
  Clock, Shield, ChevronRight, Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const HOSPITAL_TYPES = [
  { value: "all", label: "All Types" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostic", label: "Diagnostic Center" },
  { value: "specialized", label: "Specialized Hospital" },
];

export default function Hospitals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ["public-hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospitals_public")
        .select("*")
        .eq("status", "approved")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = hospitals.filter((h) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || h.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <main className="min-h-screen bg-muted/30">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-primary to-secondary py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">
              Find Hospitals Near You
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Browse our network of trusted hospitals, clinics, and diagnostic centers across Bangladesh
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
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

        {/* Results */}
        <div className="container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filtered.length} of {hospitals.length} hospitals
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No hospitals found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <section className="bg-card border-t py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-display font-bold mb-3">Are you a Hospital?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join our growing network and reach thousands of patients looking for quality healthcare.
            </p>
            <Button asChild size="lg">
              <Link to="/hospital-register">Register Your Hospital</Link>
            </Button>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function HospitalCard({ hospital }: { hospital: any }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Logo / Image */}
        <div className="md:w-48 lg:w-56 flex-shrink-0 bg-muted/50 flex items-center justify-center p-6">
          {hospital.logo_url ? (
            <img
              src={hospital.logo_url}
              alt={hospital.name || "Hospital"}
              className="h-20 md:h-24 w-auto max-w-full object-contain"
              loading="lazy"
            />
          ) : hospital.banner_url ? (
            <img
              src={hospital.banner_url}
              alt={hospital.name || "Hospital"}
              className="h-20 md:h-24 w-auto max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-lg font-semibold text-foreground">{hospital.name}</h3>
                <Badge variant="secondary" className="text-xs capitalize">
                  {hospital.type || "Hospital"}
                </Badge>
                {hospital.emergency_services && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    24/7 Emergency
                  </Badge>
                )}
              </div>

              {hospital.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {hospital.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {(hospital.city || hospital.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {[hospital.city, hospital.state].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>

              {/* Facilities */}
              {hospital.facilities && hospital.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hospital.facilities.slice(0, 5).map((f: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {f}
                    </Badge>
                  ))}
                  {hospital.facilities.length > 5 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{hospital.facilities.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/hospitals/${hospital.slug || hospital.id}`}>
                  Details <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/doctors?hospital=${hospital.id}`}>
                  Find Doctors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
