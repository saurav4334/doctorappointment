import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Award, 
  Languages, 
  Calendar,
  Phone,
  ChevronRight,
  Check,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { BookingModal } from "@/components/booking/BookingModal";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DoctorData {
  id: string;
  full_name: string;
  title: string | null;
  specializations: string[] | null;
  bio: string | null;
  qualifications: string[] | null;
  awards: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  rating: number | null;
  total_reviews: number | null;
  photo_url: string | null;
  consultation_fee: number | null;
  slug: string | null;
  doctor_hospitals: {
    hospital_id: string;
    department_id: string | null;
    is_primary: boolean | null;
    hospitals: {
      id: string;
      name: string;
      city: string | null;
    } | null;
    departments: {
      id: string;
      name: string;
    } | null;
  }[];
  doctor_schedules: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    hospital_id: string;
    hospitals: {
      name: string;
    } | null;
  }[];
}

// Day names for schedule display
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Generate available slots based on schedules
function generateAvailableSlots(schedules: DoctorData["doctor_schedules"]) {
  const today = new Date();
  const slots = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    
    const daySchedules = schedules.filter(s => s.day_of_week === dayOfWeek);
    if (daySchedules.length === 0) continue;
    
    const timeSlots: string[] = [];
    daySchedules.forEach(schedule => {
      const startHour = parseInt(schedule.start_time.split(":")[0]);
      const endHour = parseInt(schedule.end_time.split(":")[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        timeSlots.push(`${displayHour}:00 ${period}`);
        timeSlots.push(`${displayHour}:30 ${period}`);
      }
    });
    
    if (timeSlots.length > 0) {
      let dateLabel: string;
      if (i === 0) dateLabel = `Today, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      else if (i === 1) dateLabel = `Tomorrow, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      else dateLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      
      slots.push({ date: dateLabel, slots: timeSlots.slice(0, 8) }); // Limit to 8 slots per day
    }
    
    if (slots.length >= 3) break; // Show max 3 days
  }
  
  // Fallback if no schedules
  if (slots.length === 0) {
    slots.push(
      { date: "Today", slots: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] },
      { date: "Tomorrow", slots: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] }
    );
  }
  
  return slots;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch doctor data from database
  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      // Try to find by slug first, then by id
      let query = supabase
        .from("doctors")
        .select(`
          id,
          full_name,
          title,
          specializations,
          bio,
          qualifications,
          awards,
          languages,
          experience_years,
          rating,
          total_reviews,
          photo_url,
          consultation_fee,
          slug,
          doctor_hospitals (
            hospital_id,
            department_id,
            is_primary,
            hospitals (id, name, city),
            departments:departments (id, name)
          ),
          doctor_schedules (
            day_of_week,
            start_time,
            end_time,
            hospital_id,
            hospitals (name)
          )
        `)
        .eq("is_active", true);
      
      // Check if id is a UUID or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");
      
      if (isUUID) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Doctor not found");
      
      return data as unknown as DoctorData;
    },
    enabled: !!id,
  });

  // Get primary hospital info
  const primaryHospital = doctor?.doctor_hospitals?.find(dh => dh.is_primary) || doctor?.doctor_hospitals?.[0];
  const hospitalName = primaryHospital?.hospitals?.name || "Hospital";
  const hospitalId = primaryHospital?.hospital_id;
  const departmentId = primaryHospital?.department_id;
  const departmentName = primaryHospital?.departments?.name;
  const location = primaryHospital?.hospitals?.city || "Dhaka";

  // Generate available slots
  const availableSlots = doctor ? generateAvailableSlots(doctor.doctor_schedules || []) : [];

  // Format schedule for display
  const scheduleDisplay = doctor?.doctor_schedules?.map(s => ({
    day: DAY_NAMES[s.day_of_week],
    time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
    hospital: s.hospitals?.name || hospitalName,
  })) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !doctor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Doctor Not Found</h1>
          <p className="mt-2 text-muted-foreground">The doctor you're looking for doesn't exist or is no longer available.</p>
          <Link to="/doctors">
            <Button className="mt-6">Browse All Doctors</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const specialty = doctor.specializations?.[0] || "General Physician";
  const fee = doctor.consultation_fee || 500;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/doctors" className="hover:text-primary">Doctors</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{doctor.full_name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Doctor Header */}
            <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:flex-row">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl md:h-48 md:w-48">
                <img
                  src={doctor.photo_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80"}
                  alt={doctor.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {specialty}
                    </span>
                    <h1 className="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">
                      {doctor.full_name}
                    </h1>
                    <p className="mt-1 text-muted-foreground">{doctor.title || doctor.qualifications?.join(", ")}</p>
                  </div>
                  {doctor.rating && (
                    <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-semibold text-amber-700">{doctor.rating}</span>
                      <span className="text-sm text-amber-600">({doctor.total_reviews || 0})</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {hospitalName}, {location}
                  </span>
                  {doctor.experience_years && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {doctor.experience_years} Years Experience
                    </span>
                  )}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Languages className="h-4 w-4 text-primary" />
                      {doctor.languages.join(", ")}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="rounded-lg bg-primary/5 px-4 py-2">
                    <span className="text-sm text-muted-foreground">Consultation Fee</span>
                    <p className="text-xl font-bold text-primary">৳{fee}</p>
                  </div>
                  <a href="tel:+8809678123456">
                    <Button variant="outline" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* About */}
            {doctor.bio && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">About</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{doctor.bio}</p>
              </div>
            )}

            {/* Qualifications */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Qualifications
                </h2>
                <ul className="mt-4 space-y-2">
                  {doctor.qualifications.map((qual, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specializations */}
            {doctor.specializations && doctor.specializations.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Specializations</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {doctor.awards && doctor.awards.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  Awards & Recognitions
                </h2>
                <ul className="mt-4 space-y-2">
                  {doctor.awards.map((award, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Schedule */}
            {scheduleDisplay.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  Weekly Schedule
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-medium text-muted-foreground">Day</th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">Time</th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">Hospital</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleDisplay.map((item, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 font-medium text-foreground">{item.day}</td>
                          <td className="py-3 text-muted-foreground">{item.time}</td>
                          <td className="py-3 text-muted-foreground">{item.hospital}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Book Appointment
                </h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">৳{fee + 50}</span>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Hospital check */}
              {!hospitalId ? (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <p>This doctor is not currently assigned to a hospital. Please check back later or contact support.</p>
                </div>
              ) : (
                <>
                  {/* Date Selection */}
                  <div className="mt-3">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {availableSlots.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedDate(index);
                            setSelectedSlot(null);
                          }}
                          className={`shrink-0 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                            selectedDate === index
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {day.date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="mt-3">
                    <div className="grid grid-cols-4 gap-1.5">
                      {availableSlots[selectedDate]?.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                            selectedSlot === slot
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button 
                    variant="hero" 
                    size="default" 
                    className="mt-4 w-full"
                    disabled={!selectedSlot}
                    onClick={() => setShowBookingModal(true)}
                  >
                    {selectedSlot ? "Book Now" : "Select Time"}
                  </Button>
                </>
              )}

              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                By booking, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSlot && hospitalId && (
        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          doctorId={doctor.id}
          doctorName={doctor.full_name}
          hospitalId={hospitalId}
          hospitalName={hospitalName}
          departmentId={departmentId || undefined}
          specialty={specialty}
          selectedDate={availableSlots[selectedDate]?.date || "Today"}
          selectedTime={selectedSlot}
          fee={fee + 50}
        />
      )}
    </Layout>
  );
}
