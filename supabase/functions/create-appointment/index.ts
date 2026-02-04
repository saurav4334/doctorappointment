import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AppointmentRequest {
  doctorId: string;
  hospitalId: string;
  departmentId?: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  symptoms?: string;
  consultationFee: number;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Phone validation for Bangladesh numbers
const PHONE_REGEX = /^(\+?880|0)?1[3-9]\d{8}$/;

// Date format validation (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Time format validation (HH:MM:SS or HH:MM)
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

function validateRequest(data: AppointmentRequest): { valid: boolean; error?: string } {
  // Required fields
  if (!data.doctorId || !UUID_REGEX.test(data.doctorId)) {
    return { valid: false, error: "Invalid or missing doctor ID" };
  }
  if (!data.hospitalId || !UUID_REGEX.test(data.hospitalId)) {
    return { valid: false, error: "Invalid or missing hospital ID" };
  }
  if (data.departmentId && !UUID_REGEX.test(data.departmentId)) {
    return { valid: false, error: "Invalid department ID" };
  }
  
  // Date validation
  if (!data.appointmentDate || !DATE_REGEX.test(data.appointmentDate)) {
    return { valid: false, error: "Invalid or missing appointment date (use YYYY-MM-DD format)" };
  }
  const appointmentDate = new Date(data.appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return { valid: false, error: "Appointment date cannot be in the past" };
  }
  
  // Time validation
  if (!data.appointmentTime || !TIME_REGEX.test(data.appointmentTime)) {
    return { valid: false, error: "Invalid or missing appointment time (use HH:MM format)" };
  }
  
  // Patient info validation
  if (!data.patientName || data.patientName.trim().length < 2) {
    return { valid: false, error: "Patient name must be at least 2 characters" };
  }
  if (data.patientName.length > 100) {
    return { valid: false, error: "Patient name too long" };
  }
  
  // Phone validation
  if (!data.patientPhone || !PHONE_REGEX.test(data.patientPhone.replace(/[\s-]/g, ""))) {
    return { valid: false, error: "Invalid phone number format" };
  }
  
  // Email validation (optional)
  if (data.patientEmail && data.patientEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.patientEmail)) {
      return { valid: false, error: "Invalid email format" };
    }
  }
  
  // Symptoms validation (optional but limited)
  if (data.symptoms && data.symptoms.length > 500) {
    return { valid: false, error: "Symptoms description too long (max 500 characters)" };
  }
  
  // Fee validation
  if (typeof data.consultationFee !== "number" || data.consultationFee < 0) {
    return { valid: false, error: "Invalid consultation fee" };
  }
  
  return { valid: true };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Parse and validate request body
    let requestData: AppointmentRequest;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate input
    const validation = validateRequest(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if authenticated user (optional for guest checkout)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabaseAuth.auth.getClaims(token);
      if (claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
      }
    }
    
    // Verify doctor exists and is active
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("id, full_name, is_active")
      .eq("id", requestData.doctorId)
      .maybeSingle();
    
    if (doctorError || !doctor) {
      return new Response(
        JSON.stringify({ success: false, error: "Doctor not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    if (!doctor.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: "Doctor is not currently available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verify hospital exists and is approved
    const { data: hospital, error: hospitalError } = await supabase
      .from("hospitals")
      .select("id, name, status")
      .eq("id", requestData.hospitalId)
      .maybeSingle();
    
    if (hospitalError || !hospital) {
      return new Response(
        JSON.stringify({ success: false, error: "Hospital not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    if (hospital.status !== "approved") {
      return new Response(
        JSON.stringify({ success: false, error: "Hospital is not currently available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // For guest checkout, we need to handle patient info differently
    let patientId: string | null = null;
    let guestName: string | null = null;
    let guestPhone: string | null = null;
    let guestEmail: string | null = null;
    
    if (userId) {
      // Authenticated user - use their profile
      patientId = userId;
      
      // Update profile with phone/name if not set
      await supabase
        .from("profiles")
        .update({ 
          phone: requestData.patientPhone,
          full_name: requestData.patientName,
        })
        .eq("id", userId);
    } else {
      // Guest checkout - store guest info directly in appointment
      guestName = requestData.patientName.trim();
      guestPhone = requestData.patientPhone.trim();
      guestEmail = requestData.patientEmail?.trim() || null;
    }
    
    // Create the appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientId,
        doctor_id: requestData.doctorId,
        hospital_id: requestData.hospitalId,
        department_id: requestData.departmentId || null,
        appointment_date: requestData.appointmentDate,
        appointment_time: requestData.appointmentTime,
        symptoms: requestData.symptoms?.trim() || null,
        consultation_fee: requestData.consultationFee,
        status: "scheduled",
        payment_status: "pending",
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail,
      })
      .select("id, appointment_number")
      .single();
    
    if (appointmentError) {
      console.error("Appointment creation error:", appointmentError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create appointment" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`Appointment created: ${appointment.id} for ${patientId ? `user ${patientId}` : `guest ${guestName}`}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: appointment.id,
          appointmentNumber: appointment.appointment_number,
          doctorName: doctor.full_name,
          hospitalName: hospital.name,
          date: requestData.appointmentDate,
          time: requestData.appointmentTime,
          fee: requestData.consultationFee,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
