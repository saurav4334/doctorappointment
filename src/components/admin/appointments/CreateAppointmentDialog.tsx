import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, getDay } from "date-fns";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const { role, hospitalId, doctorId } = useAdminAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(
    role === "hospital_admin" && hospitalId ? hospitalId : ""
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [reason, setReason] = useState("");

  // Fetch doctors
  const { data: doctors } = useQuery({
    queryKey: ["create-apt-doctors", role, hospitalId],
    queryFn: async () => {
      if (role === "doctor" && doctorId) {
        const { data } = await supabase
          .from("doctors")
          .select("id, full_name, title, consultation_fee")
          .eq("id", doctorId);
        return data || [];
      }

      let query = supabase
        .from("doctors")
        .select("id, full_name, title, consultation_fee")
        .eq("is_active", true);

      if (role === "hospital_admin" && hospitalId) {
        const { data: dh } = await supabase
          .from("doctor_hospitals")
          .select("doctor_id")
          .eq("hospital_id", hospitalId)
          .eq("is_active", true);
        const ids = dh?.map((d) => d.doctor_id) || [];
        if (ids.length === 0) return [];
        query = query.in("id", ids);
      }

      const { data } = await query.order("full_name");
      return data || [];
    },
    enabled: open,
  });

  // Auto-select doctor for doctor role
  const effectiveDoctor =
    role === "doctor" && doctorId ? doctorId : selectedDoctor;

  // Fetch hospitals for selected doctor
  const { data: hospitals } = useQuery({
    queryKey: ["create-apt-hospitals", effectiveDoctor, role, hospitalId],
    queryFn: async () => {
      if (role === "hospital_admin" && hospitalId) {
        const { data } = await supabase
          .from("hospitals")
          .select("id, name")
          .eq("id", hospitalId);
        return data || [];
      }

      if (!effectiveDoctor) return [];

      const { data: dh } = await supabase
        .from("doctor_hospitals")
        .select("hospital_id, hospitals:hospital_id(id, name)")
        .eq("doctor_id", effectiveDoctor)
        .eq("is_active", true);

      return dh?.map((d: any) => d.hospitals).filter(Boolean) || [];
    },
    enabled: open && !!effectiveDoctor,
  });

  // Fetch department for doctor+hospital
  const { data: departmentId } = useQuery({
    queryKey: ["create-apt-dept", effectiveDoctor, selectedHospital],
    queryFn: async () => {
      if (!effectiveDoctor || !selectedHospital) return null;
      const { data } = await supabase
        .from("doctor_hospitals")
        .select("department_id")
        .eq("doctor_id", effectiveDoctor)
        .eq("hospital_id", selectedHospital)
        .maybeSingle();
      return data?.department_id || null;
    },
    enabled: open && !!effectiveDoctor && !!selectedHospital,
  });

  // Fetch schedules for doctor+hospital
  const { data: schedules } = useQuery({
    queryKey: ["create-apt-schedules", effectiveDoctor, selectedHospital],
    queryFn: async () => {
      if (!effectiveDoctor || !selectedHospital) return [];
      const { data } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", effectiveDoctor)
        .eq("hospital_id", selectedHospital)
        .eq("is_active", true);
      return data || [];
    },
    enabled: open && !!effectiveDoctor && !!selectedHospital,
  });

  // Fetch existing appointments for selected date to check slot availability
  const { data: existingAppointments } = useQuery({
    queryKey: ["create-apt-existing", effectiveDoctor, selectedDate],
    queryFn: async () => {
      if (!effectiveDoctor || !selectedDate) return [];
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time, status")
        .eq("doctor_id", effectiveDoctor)
        .eq("appointment_date", selectedDate)
        .neq("status", "cancelled");
      return data || [];
    },
    enabled: open && !!effectiveDoctor && !!selectedDate,
  });

  // Generate available dates (next 14 days that match schedule days)
  const availableDates = useMemo(() => {
    if (!schedules?.length) return [];
    const scheduleDays = new Set(schedules.map((s) => s.day_of_week));
    const dates: { value: string; label: string }[] = [];
    const today = new Date();

    for (let i = 0; i < 30 && dates.length < 14; i++) {
      const date = addDays(today, i);
      if (scheduleDays.has(getDay(date))) {
        dates.push({
          value: format(date, "yyyy-MM-dd"),
          label: format(date, "EEE, MMM dd, yyyy"),
        });
      }
    }
    return dates;
  }, [schedules]);

  // Generate time slots for selected date
  const availableSlots = useMemo(() => {
    if (!schedules?.length || !selectedDate) return [];

    const dateObj = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = getDay(dateObj);
    const daySchedules = schedules.filter(
      (s) => s.day_of_week === dayOfWeek
    );

    const bookedTimes = new Set(
      existingAppointments
        ?.map((a) => a.appointment_time?.slice(0, 5))
        .filter(Boolean) || []
    );

    const slots: { time: string; label: string; available: boolean; remaining: number; max: number }[] = [];

    for (const schedule of daySchedules) {
      const slotDuration = schedule.slot_duration_minutes || 30;
      const maxPerSlot = schedule.max_patients_per_slot || 1;
      const [startH, startM] = schedule.start_time.split(":").map(Number);
      const [endH, endM] = schedule.end_time.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      for (let m = startMinutes; m < endMinutes; m += slotDuration) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const timeStr = `${h.toString().padStart(2, "0")}:${min
          .toString().padStart(2, "0")}`;

        const bookingsAtTime =
          existingAppointments?.filter(
            (a) => a.appointment_time?.slice(0, 5) === timeStr
          ).length || 0;

        const remaining = maxPerSlot - bookingsAtTime;
        const available = remaining > 0;

        const period = h >= 12 ? "PM" : "AM";
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const label = `${displayH}:${min
          .toString()
          .padStart(2, "0")} ${period}`;

        slots.push({ time: timeStr, label, available, remaining, max: maxPerSlot });
      }
    }

    return slots;
  }, [schedules, selectedDate, existingAppointments]);

  const selectedDoctorData = doctors?.find((d) => d.id === effectiveDoctor);
  const consultationFee = selectedDoctorData?.consultation_fee || 0;
  const totalFee = consultationFee + 50; // +50 service charge

  const resetForm = () => {
    if (role !== "doctor") setSelectedDoctor("");
    if (role !== "hospital_admin") setSelectedHospital("");
    setSelectedDate("");
    setSelectedSlot("");
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setSymptoms("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!effectiveDoctor || !selectedHospital || !selectedDate || !selectedSlot) {
      toast({
        title: "Missing Fields",
        description: "Please select doctor, hospital, date, and time slot.",
        variant: "destructive",
      });
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      toast({
        title: "Missing Patient Info",
        description: "Patient name and phone are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("create-appointment", {
        body: {
          doctorId: effectiveDoctor,
          hospitalId: selectedHospital,
          departmentId: departmentId || null,
          appointmentDate: selectedDate,
          appointmentTime: `${selectedSlot}:00`,
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim(),
          patientEmail: patientEmail.trim() || null,
          symptoms: symptoms.trim() || null,
          consultationFee: totalFee,
        },
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Failed to create appointment");
      }

      toast({
        title: "Appointment Created",
        description: `Appointment #${response.data.appointment.appointmentNumber} created successfully.`,
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isSubmitting) {
          onOpenChange(v);
          if (!v) resetForm();
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Create New Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Doctor Selection */}
          {role !== "doctor" && (
            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Select
                value={selectedDoctor}
                onValueChange={(v) => {
                  setSelectedDoctor(v);
                  setSelectedHospital(
                    role === "hospital_admin" && hospitalId ? hospitalId : ""
                  );
                  setSelectedDate("");
                  setSelectedSlot("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hospital Selection */}
          {role !== "hospital_admin" && effectiveDoctor && (
            <div className="space-y-2">
              <Label>Hospital *</Label>
              <Select
                value={selectedHospital}
                onValueChange={(v) => {
                  setSelectedHospital(v);
                  setSelectedDate("");
                  setSelectedSlot("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals?.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Selection */}
          {effectiveDoctor && selectedHospital && (
            <div className="space-y-2">
              <Label>Appointment Date *</Label>
              {availableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No schedules found for this doctor at this hospital.
                </p>
              ) : (
                <Select
                  value={selectedDate}
                  onValueChange={(v) => {
                    setSelectedDate(v);
                    setSelectedSlot("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Time Slot *</Label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No slots available for this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={
                        selectedSlot === slot.time ? "default" : "outline"
                      }
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className="text-xs flex flex-col h-auto py-1.5 gap-0"
                    >
                      <span>{slot.label}</span>
                      <span className={`text-[10px] ${selectedSlot === slot.time ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {slot.available ? `${slot.remaining}/${slot.max} left` : "Full"}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Patient Info */}
          {selectedSlot && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  Patient Information
                </h4>
              </div>

              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient's full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="01XXX-XXXXXX"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@email.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label>Symptoms / Reason (optional)</Label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe symptoms or reason for visit..."
                  rows={2}
                />
              </div>

              {/* Fee Summary */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span>৳{consultationFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span>৳50</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total</span>
                  <span className="text-primary">৳{totalFee}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedSlot}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
