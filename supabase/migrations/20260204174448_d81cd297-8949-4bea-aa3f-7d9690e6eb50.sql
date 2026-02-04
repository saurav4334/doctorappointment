-- Add guest patient fields to appointments table for non-authenticated bookings
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Make patient_id nullable to support guest checkouts
ALTER TABLE public.appointments
ALTER COLUMN patient_id DROP NOT NULL;

-- Add a check constraint to ensure either patient_id or guest info is provided
-- Using a trigger instead of check constraint for flexibility
CREATE OR REPLACE FUNCTION public.validate_appointment_patient()
RETURNS TRIGGER AS $$
BEGIN
  -- Either patient_id must be set, or guest info must be provided
  IF NEW.patient_id IS NULL AND (NEW.guest_name IS NULL OR NEW.guest_phone IS NULL) THEN
    RAISE EXCEPTION 'Either patient_id or guest patient information (name and phone) must be provided';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS validate_appointment_patient_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_patient_trigger
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.validate_appointment_patient();

-- Add RLS policy for guest appointments (using service role only)
CREATE POLICY "Service role can insert guest appointments"
ON public.appointments
FOR INSERT
WITH CHECK (
  is_service_role() OR auth.uid() = patient_id
);

-- Update existing insert policy to allow guest bookings via service role
DROP POLICY IF EXISTS "Patients can create appointments" ON public.appointments;

-- Comment explaining the security model for guest bookings
COMMENT ON COLUMN public.appointments.guest_name IS 'Guest patient name for non-authenticated bookings';
COMMENT ON COLUMN public.appointments.guest_phone IS 'Guest patient phone for non-authenticated bookings';
COMMENT ON COLUMN public.appointments.guest_email IS 'Guest patient email for non-authenticated bookings (optional)';