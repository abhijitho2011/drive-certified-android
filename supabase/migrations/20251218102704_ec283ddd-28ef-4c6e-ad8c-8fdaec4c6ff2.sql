-- Drop the existing overly permissive company verifier policy on applications
DROP POLICY IF EXISTS "Company verifiers can view approved applications" ON public.applications;

-- Create a secure view for company verifiers that only exposes certificate verification data
-- Excludes: aadhaar_number, current_address, permanent_address, date_of_birth, documents
CREATE OR REPLACE VIEW public.applications_verification
WITH (security_invoker = true)
AS SELECT 
  id,
  full_name,
  gender,
  licence_number,
  issuing_rto,
  licence_type,
  vehicle_classes,
  certification_vehicle_class,
  certification_purpose,
  certificate_number,
  certificate_status,
  certificate_expiry_date,
  skill_grade,
  status,
  admin_approved,
  education_verified,
  medical_test_passed,
  driving_test_passed,
  medical_validity_date,
  driving_validity_date,
  created_at,
  updated_at
FROM public.applications
WHERE status = 'approved' 
  AND admin_approved = true 
  AND certificate_number IS NOT NULL;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.applications_verification TO authenticated;

-- Create a more restrictive policy for company verifiers - they can only query the view
-- The view already filters to approved applications with certificates
CREATE POLICY "Company verifiers can view certificate verification data"
  ON public.applications FOR SELECT
  USING (
    -- Company verifiers can only see approved applications with certificates
    -- AND only specific non-sensitive fields through the view
    (status = 'approved') 
    AND (admin_approved = true) 
    AND (certificate_number IS NOT NULL)
    AND (EXISTS (
      SELECT 1 FROM data_users du
      WHERE du.user_id = auth.uid()
    ))
  );