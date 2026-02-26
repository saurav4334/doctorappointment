
-- Home services catalog (what services are offered)
CREATE TABLE public.home_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Home service requests (patient requests)
CREATE TABLE public.home_service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.home_services(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for home_services
ALTER TABLE public.home_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active home services viewable by everyone"
  ON public.home_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can view all home services"
  ON public.home_services FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert home services"
  ON public.home_services FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update home services"
  ON public.home_services FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete home services"
  ON public.home_services FOR DELETE
  USING (is_super_admin(auth.uid()));

-- RLS for home_service_requests
ALTER TABLE public.home_service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit home service requests"
  ON public.home_service_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Super admins can view all requests"
  ON public.home_service_requests FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update requests"
  ON public.home_service_requests FOR UPDATE
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete requests"
  ON public.home_service_requests FOR DELETE
  USING (is_super_admin(auth.uid()));
