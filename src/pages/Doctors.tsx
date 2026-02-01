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
import { Search, Star, MapPin, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";

// Mock doctors data
const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Ahmed",
    title: "MBBS, MD (Cardiology)",
    specialty: "Cardiologist",
    department: "Cardiology",
    hospital: "City General Hospital",
    location: "Gulshan, Dhaka",
    experience: 15,
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    fee: 1500,
    availableToday: true,
  },
  {
    id: "2",
    name: "Dr. Mohammad Rahman",
    title: "MBBS, FCPS (Medicine)",
    specialty: "Internal Medicine",
    department: "Medicine",
    hospital: "Central Medical Center",
    location: "Banani, Dhaka",
    experience: 20,
    rating: 4.8,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    fee: 1200,
    availableToday: false,
  },
  {
    id: "3",
    name: "Dr. Fatima Khan",
    title: "MBBS, DCH (Pediatrics)",
    specialty: "Pediatrician",
    department: "Pediatrics",
    hospital: "Children's Hospital",
    location: "Dhanmondi, Dhaka",
    experience: 12,
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    fee: 1000,
    availableToday: true,
  },
  {
    id: "4",
    name: "Dr. Karim Hassan",
    title: "MBBS, MS (Orthopedics)",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    hospital: "Bone & Joint Center",
    location: "Uttara, Dhaka",
    experience: 18,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    fee: 1800,
    availableToday: true,
  },
  {
    id: "5",
    name: "Dr. Nusrat Jahan",
    title: "MBBS, FCPS (Gynae)",
    specialty: "Gynecologist",
    department: "Gynecology",
    hospital: "Women's Health Center",
    location: "Gulshan, Dhaka",
    experience: 14,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80",
    fee: 1400,
    availableToday: false,
  },
  {
    id: "6",
    name: "Dr. Tanvir Hossain",
    title: "MBBS, MS (Neurology)",
    specialty: "Neurologist",
    department: "Neurology",
    hospital: "Brain & Spine Center",
    location: "Mohakhali, Dhaka",
    experience: 16,
    rating: 4.8,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80",
    fee: 2000,
    availableToday: true,
  },
];

const departments = [
  "All Departments",
  "Cardiology",
  "Medicine",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Neurology",
  "Dermatology",
  "ENT",
  "Ophthalmology",
];

const locations = [
  "All Locations",
  "Gulshan, Dhaka",
  "Banani, Dhaka",
  "Dhanmondi, Dhaka",
  "Uttara, Dhaka",
  "Mohakhali, Dhaka",
];

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

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
              Search from our network of 200+ experienced doctors across 50+ hospitals
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
                  {/* Image */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                    />
                    {doctor.availableToday && (
                      <div className="absolute bottom-1 left-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Available Today
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-primary">{doctor.specialty}</span>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{doctor.title}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-amber-700">{doctor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {doctor.location}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{doctor.hospital}</p>
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
                  <Link to={`/doctors/${doctor.id}`}>
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
        </div>
      </section>
    </Layout>
  );
}
