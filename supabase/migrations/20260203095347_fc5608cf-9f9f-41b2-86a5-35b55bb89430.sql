-- Allow doctors to view their own schedules
CREATE POLICY "Doctors can view their schedules" 
ON public.doctor_schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = doctor_schedules.doctor_id
  )
);

-- Allow doctors to insert their own schedules
CREATE POLICY "Doctors can insert their schedules" 
ON public.doctor_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = doctor_schedules.doctor_id
  )
);

-- Allow doctors to update their own schedules
CREATE POLICY "Doctors can update their schedules" 
ON public.doctor_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = doctor_schedules.doctor_id
  )
);

-- Allow doctors to delete their own schedules
CREATE POLICY "Doctors can delete their schedules" 
ON public.doctor_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = doctor_schedules.doctor_id
  )
);

-- Allow super admins full access
CREATE POLICY "Super admins can view all schedules" 
ON public.doctor_schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can insert schedules" 
ON public.doctor_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can update schedules" 
ON public.doctor_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can delete schedules" 
ON public.doctor_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Allow hospital admins to manage schedules in their hospital
CREATE POLICY "Hospital admins can view hospital schedules" 
ON public.doctor_schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_schedules.hospital_id
  )
);

CREATE POLICY "Hospital admins can insert hospital schedules" 
ON public.doctor_schedules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_schedules.hospital_id
  )
);

CREATE POLICY "Hospital admins can update hospital schedules" 
ON public.doctor_schedules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_schedules.hospital_id
  )
);

CREATE POLICY "Hospital admins can delete hospital schedules" 
ON public.doctor_schedules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = doctor_schedules.hospital_id
  )
);