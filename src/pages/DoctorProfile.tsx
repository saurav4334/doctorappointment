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
  Check
} from "lucide-react";
import { useState } from "react";

// Mock doctor data (in real app, fetch from API)
const doctorData = {
  id: "1",
  name: "Dr. Sarah Ahmed",
  title: "MBBS, MD (Cardiology), FACC",
  specialty: "Cardiologist",
  department: "Cardiology",
  hospital: "City General Hospital",
  location: "Gulshan, Dhaka",
  experience: 15,
  rating: 4.9,
  reviews: 127,
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
  fee: 1500,
  bio: "Dr. Sarah Ahmed is a renowned cardiologist with over 15 years of experience in diagnosing and treating cardiovascular diseases. She specializes in interventional cardiology and has performed over 5,000 successful cardiac procedures. Dr. Ahmed is known for her patient-centric approach and commitment to providing the highest quality care.",
  qualifications: [
    "MBBS - Dhaka Medical College, 2005",
    "MD (Cardiology) - National Heart Foundation, 2010",
    "FACC - American College of Cardiology, 2015",
  ],
  specializations: [
    "Interventional Cardiology",
    "Heart Failure Management",
    "Preventive Cardiology",
    "Cardiac Rehabilitation",
    "Echocardiography",
  ],
  awards: [
    "Best Cardiologist Award - Bangladesh Medical Association, 2022",
    "Excellence in Patient Care - City General Hospital, 2021",
    "Research Excellence Award - NHFB, 2019",
  ],
  languages: ["Bengali", "English", "Hindi"],
  schedule: [
    { day: "Sunday", time: "10:00 AM - 2:00 PM", hospital: "City General Hospital" },
    { day: "Monday", time: "4:00 PM - 8:00 PM", hospital: "City General Hospital" },
    { day: "Wednesday", time: "10:00 AM - 2:00 PM", hospital: "Heart Care Center" },
    { day: "Thursday", time: "4:00 PM - 8:00 PM", hospital: "City General Hospital" },
  ],
};

// Mock available slots
const availableSlots = [
  { date: "Today, Feb 1", slots: ["10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM"] },
  { date: "Tomorrow, Feb 2", slots: ["4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "7:00 PM"] },
  { date: "Sun, Feb 3", slots: ["10:00 AM", "10:30 AM", "11:00 AM", "12:00 PM", "1:00 PM"] },
];

export default function DoctorProfile() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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
            <span className="text-foreground">{doctorData.name}</span>
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
                  src={doctorData.image}
                  alt={doctorData.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {doctorData.specialty}
                    </span>
                    <h1 className="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">
                      {doctorData.name}
                    </h1>
                    <p className="mt-1 text-muted-foreground">{doctorData.title}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold text-amber-700">{doctorData.rating}</span>
                    <span className="text-sm text-amber-600">({doctorData.reviews})</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {doctorData.hospital}, {doctorData.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {doctorData.experience} Years Experience
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-primary" />
                    {doctorData.languages.join(", ")}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="rounded-lg bg-primary/5 px-4 py-2">
                    <span className="text-sm text-muted-foreground">Consultation Fee</span>
                    <p className="text-xl font-bold text-primary">৳{doctorData.fee}</p>
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
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">About</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{doctorData.bio}</p>
            </div>

            {/* Qualifications */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <GraduationCap className="h-5 w-5 text-primary" />
                Qualifications
              </h2>
              <ul className="mt-4 space-y-2">
                {doctorData.qualifications.map((qual, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {qual}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Specializations</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {doctorData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                <Award className="h-5 w-5 text-primary" />
                Awards & Recognitions
              </h2>
              <ul className="mt-4 space-y-2">
                {doctorData.awards.map((award, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    {award}
                  </li>
                ))}
              </ul>
            </div>

            {/* Schedule */}
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
                    {doctorData.schedule.map((item, index) => (
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
          </div>

          {/* Booking Sidebar - Compact Design */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Book Appointment
                </h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">৳{doctorData.fee + 50}</span>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Date Selection - Compact */}
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

              {/* Time Slots - Compact Grid */}
              <div className="mt-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {availableSlots[selectedDate].slots.map((slot) => (
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

              {/* Book Button - Directly book without auth */}
              <Button 
                variant="hero" 
                size="default" 
                className="mt-4 w-full"
                disabled={!selectedSlot}
                onClick={() => {
                  if (selectedSlot) {
                    // Direct booking without auth requirement
                    console.log("Booking:", { date: availableSlots[selectedDate].date, slot: selectedSlot });
                    alert(`Appointment booked for ${availableSlots[selectedDate].date} at ${selectedSlot}`);
                  }
                }}
              >
                {selectedSlot ? "Book Now" : "Select Time"}
              </Button>

              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                By booking, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
