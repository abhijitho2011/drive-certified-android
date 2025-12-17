-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Company verifiers can view approved applications for verificati" ON public.applications;

-- Create as PERMISSIVE policy
CREATE POLICY "Company verifiers can view approved applications"
  ON public.applications FOR SELECT TO authenticated
  USING (
    status = 'approved' 
    AND admin_approved = true 
    AND certificate_number IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
  );

-- Also fix the drivers policy to be permissive
DROP POLICY IF EXISTS "Company verifiers can view drivers for verified applications" ON public.drivers;

CREATE POLICY "Company verifiers can view drivers for verified applications"
  ON public.drivers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.driver_id = drivers.id
        AND a.status = 'approved'
        AND a.admin_approved = true
        AND a.certificate_number IS NOT NULL
    )
  );

-- Fix driving test results policy to be permissive
DROP POLICY IF EXISTS "Company verifiers can view driving results for verified apps" ON public.driving_test_results;

CREATE POLICY "Company verifiers can view driving results for verified apps"
  ON public.driving_test_results FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = driving_test_results.application_id
        AND a.status = 'approved'
        AND a.admin_approved = true
        AND a.certificate_number IS NOT NULL
    )
  );

-- Fix medical test results policy to be permissive
DROP POLICY IF EXISTS "Company verifiers can view medical results for verified apps" ON public.medical_test_results;

CREATE POLICY "Company verifiers can view medical results for verified apps"
  ON public.medical_test_results FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = medical_test_results.application_id
        AND a.status = 'approved'
        AND a.admin_approved = true
        AND a.certificate_number IS NOT NULL
    )
  );