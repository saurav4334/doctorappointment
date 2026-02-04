-- Create a public view for hospitals that hides sensitive contact information
-- This view only exposes non-sensitive fields for public consumption
CREATE VIEW public.hospitals_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  slug,
  type,
  description,
  city,
  state,
  logo_url,
  banner_url,
  status,
  emergency_services,
  facilities,
  latitude,
  longitude,
  created_at,
  updated_at
  -- Excluded: email, phone, address, postal_code, website, admin_user_id, registration_number
FROM public.hospitals;

-- Drop the existing public SELECT policy that exposes all data
DROP POLICY IF EXISTS "Approved hospitals are viewable by everyone" ON public.hospitals;

-- Create a new policy that denies direct public access to the hospitals table
-- Users must use the hospitals_public view for public data
CREATE POLICY "Authenticated users can view approved hospitals"
ON public.hospitals
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Super admin policy already exists and will continue to work

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.hospitals_public TO anon;
GRANT SELECT ON public.hospitals_public TO authenticated;