-- Allow company verifiers to view approved applications for certificate verification
CREATE POLICY "Company verifiers can view approved applications for verification"
  ON public.applications FOR SELECT
  USING (
    status = 'approved' 
    AND admin_approved = true 
    AND certificate_number IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
  );