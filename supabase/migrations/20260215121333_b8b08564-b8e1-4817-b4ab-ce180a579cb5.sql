
CREATE TABLE public.ambulance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  pickup_location TEXT NOT NULL,
  pickup_latitude NUMERIC,
  pickup_longitude NUMERIC,
  destination TEXT,
  ambulance_type TEXT NOT NULL DEFAULT 'basic',
  emergency_level TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an ambulance request (public form)
CREATE POLICY "Anyone can submit ambulance requests"
ON public.ambulance_requests
FOR INSERT
WITH CHECK (true);

-- Super admins can view all requests
CREATE POLICY "Super admins can view ambulance requests"
ON public.ambulance_requests
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admins can update requests
CREATE POLICY "Super admins can update ambulance requests"
ON public.ambulance_requests
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Super admins can delete requests
CREATE POLICY "Super admins can delete ambulance requests"
ON public.ambulance_requests
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Timestamp trigger
CREATE TRIGGER update_ambulance_requests_updated_at
BEFORE UPDATE ON public.ambulance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
