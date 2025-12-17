-- Allow company verifiers to view drivers for approved applications
CREATE POLICY "Company verifiers can view drivers for verified applications"
  ON public.drivers FOR SELECT
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

-- Allow company verifiers to view driving test results for approved applications
CREATE POLICY "Company verifiers can view driving results for verified apps"
  ON public.driving_test_results FOR SELECT
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

-- Allow company verifiers to view medical test results for approved applications (excluding drug details handled in code)
CREATE POLICY "Company verifiers can view medical results for verified apps"
  ON public.medical_test_results FOR SELECT
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