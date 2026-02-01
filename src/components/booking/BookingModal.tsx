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
  doctorName: string;
  specialty: string;
  selectedDate: string;
  selectedTime: string;
  fee: number;
}

export function BookingModal({
  open,
  onOpenChange,
  doctorName,
  specialty,
  selectedDate,
  selectedTime,
  fee,
}: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    
    // Simulate API call - in production, this would save to database
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Send SMS notification
    try {
      const smsMessage = `আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।\n\nডাক্তার: ${doctorName}\nতারিখ: ${selectedDate}\nসময়: ${selectedTime}\nফি: ৳${fee}\n\nধন্যবাদ!`;
      
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: result.data.phone,
          message: smsMessage,
        },
      });
    } catch (smsError) {
      console.log("SMS notification failed:", smsError);
      // Don't fail the booking if SMS fails
    }
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${doctorName} is confirmed for ${selectedDate} at ${selectedTime}.`,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form after close animation
      setTimeout(() => {
        setFormData({ fullName: "", phone: "", email: "", symptoms: "" });
        setErrors({});
        setIsSuccess(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Booking Confirmed!
            </h3>
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
