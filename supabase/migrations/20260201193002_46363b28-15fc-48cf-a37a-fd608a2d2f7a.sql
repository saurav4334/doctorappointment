-- Create enum for SMS provider types
CREATE TYPE public.sms_provider_type AS ENUM (
  'khudebarta',
  'ssl_wireless', 
  'bdbulksms',
  'muthofun',
  'infobip',
  'custom'
);

-- Create SMS providers table
CREATE TABLE public.sms_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type sms_provider_type NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  secret_key TEXT,
  sender_id TEXT,
  client_trans_id TEXT,
  additional_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_providers ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage SMS providers
CREATE POLICY "Super admins can view SMS providers"
ON public.sms_providers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);

CREATE POLICY "Super admins can insert SMS providers"
ON public.sms_providers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);

CREATE POLICY "Super admins can update SMS providers"
ON public.sms_providers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);

CREATE POLICY "Super admins can delete SMS providers"
ON public.sms_providers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_sms_providers_updated_at
BEFORE UPDATE ON public.sms_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create SMS logs table for tracking sent messages
CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.sms_providers(id),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  provider_response JSONB,
  error_message TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on SMS logs
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view all SMS logs
CREATE POLICY "Super admins can view SMS logs"
ON public.sms_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);

-- Edge function can insert logs (no auth check for service role)
CREATE POLICY "Service role can insert SMS logs"
ON public.sms_logs
FOR INSERT
WITH CHECK (true);