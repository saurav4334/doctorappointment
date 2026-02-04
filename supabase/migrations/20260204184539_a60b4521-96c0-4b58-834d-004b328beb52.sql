-- Add RLS policies for review moderation

-- Super admins can update reviews (for moderation)
CREATE POLICY "Super admins can update reviews"
ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Super admins can delete reviews (for removing inappropriate content)
CREATE POLICY "Super admins can delete reviews"
ON public.reviews FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role_key = 'super_admin'
    AND user_roles.is_active = true
  )
);

-- Hospital admins can moderate reviews for their hospital's doctors
CREATE POLICY "Hospital admins can moderate hospital reviews"
ON public.reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN doctor_hospitals dh ON dh.hospital_id = ur.hospital_id
    WHERE ur.user_id = auth.uid()
    AND ur.role_key = 'hospital_admin'
    AND ur.is_active = true
    AND dh.doctor_id = reviews.doctor_id
  )
);

-- Patients can update their own pending reviews (before approval)
CREATE POLICY "Patients can update their pending reviews"
ON public.reviews FOR UPDATE
USING (
  auth.uid() = patient_id 
  AND is_approved = false
);

-- Patients can delete their own pending reviews
CREATE POLICY "Patients can delete their pending reviews"
ON public.reviews FOR DELETE
USING (
  auth.uid() = patient_id 
  AND is_approved = false
);