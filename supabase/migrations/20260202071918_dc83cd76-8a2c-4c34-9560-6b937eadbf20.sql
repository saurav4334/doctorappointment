-- Add RLS policies for super admin to manage doctors
CREATE POLICY "Super admins can insert doctors" 
ON public.doctors 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can update doctors" 
ON public.doctors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can delete doctors" 
ON public.doctors 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Hospital admin can update doctors in their hospital
CREATE POLICY "Hospital admins can update their doctors" 
ON public.doctors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN doctor_hospitals dh ON dh.hospital_id = ur.hospital_id
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND dh.doctor_id = doctors.id
  )
);

-- Add RLS policies for super admin to manage hospitals
CREATE POLICY "Super admins can insert hospitals" 
ON public.hospitals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can update hospitals" 
ON public.hospitals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

CREATE POLICY "Super admins can delete hospitals" 
ON public.hospitals 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Super admins can view all profiles for user management
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Super admins can view all user roles
CREATE POLICY "Super admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'super_admin'
    AND ur.is_active = true
  )
);

-- Super admins can insert user roles
CREATE POLICY "Super admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'super_admin'
    AND ur.is_active = true
  )
);

-- Super admins can update user roles
CREATE POLICY "Super admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'super_admin'
    AND ur.is_active = true
  )
);

-- Super admins can view all hospitals (including non-approved)
CREATE POLICY "Super admins can view all hospitals" 
ON public.hospitals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Super admins can view all doctors (including inactive)
CREATE POLICY "Super admins can view all doctors" 
ON public.doctors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Super admins can view all appointments
CREATE POLICY "Super admins can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Hospital admins can view appointments in their hospital
CREATE POLICY "Hospital admins can view hospital appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND ur.hospital_id = appointments.hospital_id
  )
);

-- Doctors can view their own appointments
CREATE POLICY "Doctors can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM doctors d
    WHERE d.user_id = auth.uid()
    AND d.id = appointments.doctor_id
  )
);