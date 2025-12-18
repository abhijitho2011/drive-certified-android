-- Drop existing overly permissive SELECT policies on drivers
DROP POLICY IF EXISTS "Company verifiers can view drivers for verified applications" ON public.drivers;

-- Create more restrictive policy for company verifiers - only view drivers with verified certificates
CREATE POLICY "Company verifiers can view drivers for verified applications"
  ON public.drivers FOR SELECT
  USING (
    (EXISTS (
      SELECT 1 FROM data_users du
      WHERE du.user_id = auth.uid()
    )) AND enterprise_can_view_driver(auth.uid(), id)
  );

-- Add policy for partners to view only drivers assigned to their applications
CREATE POLICY "Partners can view assigned drivers"
  ON public.drivers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN partners p ON (p.id = a.driving_school_id OR p.id = a.medical_lab_id OR p.id = a.verification_agent_id)
      WHERE a.driver_id = drivers.id
      AND p.user_id = auth.uid()
    )
  );