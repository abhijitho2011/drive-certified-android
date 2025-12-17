-- Allow partners (driving schools and medical labs) to update applications they are assigned to
CREATE POLICY "Partners can update assigned applications"
ON public.applications FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM partners 
  WHERE partners.user_id = auth.uid() 
  AND (partners.id = applications.driving_school_id OR partners.id = applications.medical_lab_id)
));