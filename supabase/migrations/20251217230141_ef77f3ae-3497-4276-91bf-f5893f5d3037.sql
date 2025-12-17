-- Allow verification agents to view all applications for education verification
DROP POLICY IF EXISTS "Verification agents can view assigned applications" ON public.applications;

CREATE POLICY "Verification agents can view all applications"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.user_id = auth.uid()
    AND partners.partner_type = 'verification_agent'
  )
);

-- Allow verification agents to update education_verified field on any application
DROP POLICY IF EXISTS "Verification agents can update education verification" ON public.applications;

CREATE POLICY "Verification agents can update education verification"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.user_id = auth.uid()
    AND partners.partner_type = 'verification_agent'
  )
);