-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can insert SMS logs" ON public.sms_logs;

-- Create a function to check if request is from service role (for edge functions)
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
$$;

-- Edge functions using service role can insert logs
CREATE POLICY "Edge functions can insert SMS logs"
ON public.sms_logs
FOR INSERT
WITH CHECK (
  public.is_service_role() OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role_key = 'super_admin'
    AND is_active = true
  )
);