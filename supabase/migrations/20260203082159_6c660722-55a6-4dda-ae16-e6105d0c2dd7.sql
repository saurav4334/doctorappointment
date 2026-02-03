-- Allow super admins to update any appointment
CREATE POLICY "Super admins can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Allow hospital admins to update appointments in their hospital
CREATE POLICY "Hospital admins can update hospital appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = appointments.hospital_id
  )
);

-- Allow doctors to update their own appointments
CREATE POLICY "Doctors can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = appointments.doctor_id
  )
);