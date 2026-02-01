import { Button } from "@/components/ui/button";
import { Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock featured doctors data
const featuredDoctors = [
  {
    id: "1",
    name: "Dr. Sarah Ahmed",
    title: "MBBS, MD (Cardiology)",
    specialty: "Cardiologist",
    hospital: "City General Hospital",
    experience: 15,
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    fee: 1500,
  },
  {
    id: "2",
    name: "Dr. Mohammad Rahman",
    title: "MBBS, FCPS (Medicine)",
    specialty: "Internal Medicine",
    hospital: "Central Medical Center",
    experience: 20,
    rating: 4.8,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    fee: 1200,
  },
  {
    id: "3",
    name: "Dr. Fatima Khan",
    title: "MBBS, DCH (Pediatrics)",
    specialty: "Pediatrician",
    hospital: "Children's Hospital",
    experience: 12,
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    fee: 1000,
  },
  {
    id: "4",
    name: "Dr. Karim Hassan",
    title: "MBBS, MS (Orthopedics)",
    specialty: "Orthopedic Surgeon",
    hospital: "Bone & Joint Center",
    experience: 18,
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    fee: 1800,
  },
];

export function FeaturedDoctors() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Our Experts
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Top Rated Doctors
            </h2>
          </div>
          <Link to="/doctors">
            <Button variant="outline" className="group">
              View All Doctors
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Doctors Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDoctors.map((doctor) => (
            <Link
              key={doctor.id}
              to={`/doctors/${doctor.id}`}
              className="group overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-muted-foreground">({doctor.reviews})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-xs font-medium text-primary">{doctor.specialty}</div>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {doctor.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{doctor.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{doctor.hospital}</p>
                
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Experience</span>
                    <p className="text-sm font-medium">{doctor.experience} Years</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Fee</span>
                    <p className="text-sm font-semibold text-primary">৳{doctor.fee}</p>
                  </div>
                </div>

                <Button variant="hero" size="sm" className="mt-4 w-full">
                  Book Appointment
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDoctors;
