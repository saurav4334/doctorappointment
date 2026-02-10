import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, MapPin, Clock, Filter, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // Fetch doctors from database
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors-listing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id, full_name, title, specializations, experience_years, rating, total_reviews,
          photo_url, consultation_fee, slug, is_featured,
          doctor_hospitals (
            hospital_id, is_primary,
            hospitals (name, city),
            departments:departments (name)
          )
        `)
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      return (data || []).map((doc) => {
        const primary = doc.doctor_hospitals?.find((dh: any) => dh.is_primary) || doc.doctor_hospitals?.[0];
        return {
          id: doc.id,
          slug: doc.slug || doc.id,
          name: doc.full_name,
          title: doc.title || doc.specializations?.join(", ") || "",
          specialty: doc.specializations?.[0] || "General",
          department: primary?.departments?.name || "General",
          hospital: primary?.hospitals?.name || "",
          location: primary?.hospitals?.city || "",
          experience: doc.experience_years || 0,
          rating: doc.rating || 0,
          reviews: doc.total_reviews || 0,
          image: doc.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
          fee: doc.consultation_fee || 500,
        };
      });
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("name").eq("is_active", true).order("name");
      return ["All Departments", ...(data?.map((d) => d.name) || [])];
    },
  });

  // Derive unique locations
  const locations = ["All Locations", ...Array.from(new Set(doctors.map((d) => d.location).filter(Boolean)))];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "All Departments" || 
      doctor.department === selectedDepartment;
    const matchesLocation = selectedLocation === "All Locations" || 
      doctor.location === selectedLocation;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Find & Book Your Doctor
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search from our network of experienced doctors across multiple hospitals
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mx-auto mt-8 max-w-4xl">
            <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-lg md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by doctor name or specialty..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="hero" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors
                </p>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="fee-low">Fee: Low to High</SelectItem>
                    <SelectItem value="fee-high">Fee: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-primary">{doctor.specialty}</span>
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{doctor.title}</p>
                          </div>
                          {doctor.rating > 0 && (
                            <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-amber-700">{doctor.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          {doctor.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {doctor.location}
                            </span>
                          )}
                        </div>
                        {doctor.hospital && (
                          <p className="mt-1 text-sm text-muted-foreground">{doctor.hospital}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {doctor.experience} yrs exp
                        </span>
                        <span className="font-semibold text-primary">৳{doctor.fee}</span>
                      </div>
                      <Link to={`/doctors/${doctor.slug}`}>
                        <Button variant="hero" size="sm">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-lg text-muted-foreground">
                    No doctors found matching your criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDepartment("All Departments");
                      setSelectedLocation("All Locations");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
