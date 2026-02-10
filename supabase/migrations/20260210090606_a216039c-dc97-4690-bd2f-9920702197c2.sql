
-- Allow super admins to insert into doctor_hospitals
CREATE POLICY "Super admins can insert doctor_hospitals"
ON public.doctor_hospitals
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
));

-- Allow super admins to update doctor_hospitals
CREATE POLICY "Super admins can update doctor_hospitals"
ON public.doctor_hospitals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
));

-- Allow super admins to delete doctor_hospitals
CREATE POLICY "Super admins can delete doctor_hospitals"
ON public.doctor_hospitals
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
));

-- Allow super admins to view all doctor_hospitals (including inactive)
CREATE POLICY "Super admins can view all doctor_hospitals"
ON public.doctor_hospitals
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
));

-- Allow hospital admins to manage their hospital's doctor assignments
CREATE POLICY "Hospital admins can insert doctor_hospitals"
ON public.doctor_hospitals
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_hospitals.hospital_id
));

CREATE POLICY "Hospital admins can update doctor_hospitals"
ON public.doctor_hospitals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_hospitals.hospital_id
));

CREATE POLICY "Hospital admins can delete doctor_hospitals"
ON public.doctor_hospitals
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_hospitals.hospital_id
));

CREATE POLICY "Hospital admins can view their doctor_hospitals"
ON public.doctor_hospitals
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_hospitals.hospital_id
));
