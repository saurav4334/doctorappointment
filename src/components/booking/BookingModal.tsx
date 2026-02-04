import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Phone, Mail, FileText, Check } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const patientSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(15, "Phone number too long"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  symptoms: z.string().trim().max(500, "Please keep symptoms under 500 characters").optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  departmentId?: string;
  specialty: string;
  selectedDate: string;
  selectedTime: string;
  fee: number;
}

export function BookingModal({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  hospitalId,
  hospitalName,
  departmentId,
  specialty,
  selectedDate,
  selectedTime,
  fee,
}: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appointmentNumber, setAppointmentNumber] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "",
    phone: "",
    email: "",
    symptoms: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Parse selected date to ISO format (YYYY-MM-DD)
  const parseSelectedDate = (dateStr: string): string => {
    // Handle formats like "Today, Feb 1", "Tomorrow, Feb 2", "Sun, Feb 3"
    const today = new Date();
    const year = today.getFullYear();
    
    if (dateStr.toLowerCase().includes("today")) {
      return today.toISOString().split("T")[0];
    }
    if (dateStr.toLowerCase().includes("tomorrow")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    }
    
    // Parse month and day from format like "Sun, Feb 3"
    const monthMap: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const parts = dateStr.toLowerCase().split(/[,\s]+/);
    for (const part of parts) {
      const monthKey = part.substring(0, 3);
      if (monthMap[monthKey] !== undefined) {
        const dayStr = parts[parts.indexOf(part) + 1];
        const day = parseInt(dayStr, 10);
        if (!isNaN(day)) {
          const date = new Date(year, monthMap[monthKey], day);
          // If date is in the past, assume next year
          if (date < today) {
            date.setFullYear(year + 1);
          }
          return date.toISOString().split("T")[0];
        }
      }
    }
    
    // Fallback to today
    return today.toISOString().split("T")[0];
  };

  // Parse time to 24-hour format (HH:MM:SS)
  const parseSelectedTime = (timeStr: string): string => {
    // Handle formats like "10:30 AM", "2:00 PM"
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return "09:00:00";
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = patientSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PatientFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof PatientFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create appointment via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionData?.session?.access_token) {
        headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
      }

      const appointmentResponse = await supabase.functions.invoke("create-appointment", {
        body: {
          doctorId,
          hospitalId,
          departmentId: departmentId || null,
          appointmentDate: parseSelectedDate(selectedDate),
          appointmentTime: parseSelectedTime(selectedTime),
          patientName: result.data.fullName.trim(),
          patientPhone: result.data.phone.trim(),
          patientEmail: result.data.email?.trim() || null,
          symptoms: result.data.symptoms?.trim() || null,
          consultationFee: fee,
        },
      });

      if (appointmentResponse.error || !appointmentResponse.data?.success) {
        throw new Error(appointmentResponse.data?.error || "Failed to create appointment");
      }

      const appointmentData = appointmentResponse.data.appointment;
      setAppointmentNumber(appointmentData.appointmentNumber);
      
      // Send SMS notification (optional, don't fail if it fails)
      try {
        const smsMessage = `আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।\n\nবুকিং নম্বর: ${appointmentData.appointmentNumber}\nডাক্তার: ${doctorName}\nতারিখ: ${selectedDate}\nসময়: ${selectedTime}\nফি: ৳${fee}\n\nধন্যবাদ!`;
        
        await supabase.functions.invoke("send-sms", {
          body: {
            phone: result.data.phone,
            message: smsMessage,
            appointmentId: appointmentData.id,
          },
        });
      } catch (smsError) {
        console.log("SMS notification failed:", smsError);
        // Don't fail the booking if SMS fails
      }
      
      setIsSuccess(true);
      
      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${doctorName} is confirmed. Booking #${appointmentData.appointmentNumber}`,
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form after close animation
      setTimeout(() => {
        setFormData({ fullName: "", phone: "", email: "", symptoms: "" });
        setErrors({});
        setIsSuccess(false);
        setAppointmentNumber(null);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Booking Confirmed!
            </h3>
            {appointmentNumber && (
              <p className="mt-2 text-sm font-medium text-primary">
                Booking #{appointmentNumber}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Your appointment with {doctorName} is confirmed for {selectedDate} at {selectedTime}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll send a confirmation SMS to your phone.
            </p>
            <Button variant="hero" className="mt-6 w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Header with appointment info */}
            <div className="bg-primary/5 p-4 border-b">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Complete Your Booking</DialogTitle>
              </DialogHeader>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{doctorName}</span>
                  <span>• {specialty}</span>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {selectedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {selectedTime}
                </span>
              </div>
            </div>

            {/* Patient Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Patient Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter patient's full name"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXX-XXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Symptoms / Reason <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  rows={2}
                  value={formData.symptoms}
                  onChange={(e) => handleChange("symptoms", e.target.value)}
                  className={errors.symptoms ? "border-destructive" : ""}
                />
                {errors.symptoms && (
                  <p className="text-xs text-destructive">{errors.symptoms}</p>
                )}
              </div>

              {/* Fee summary */}
              <div className="rounded-lg bg-muted/50 p-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-primary">৳{fee}</span>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
