-- Fix applications table RLS policies that have circular references

-- 1. Create function for drivers to check application ownership
CREATE OR REPLACE FUNCTION public.driver_owns_application(_user_id uuid, _driver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM drivers d
    WHERE d.id = _driver_id
      AND d.user_id = _user_id
  )
$$;

-- 2. Create function for partners (driving school/medical lab/verification agent) to check application access
CREATE OR REPLACE FUNCTION public.partner_can_access_application(_user_id uuid, _app_driving_school_id uuid, _app_medical_lab_id uuid, _app_verification_agent_id uuid, _partner_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM partners p
    WHERE p.user_id = _user_id
      AND p.partner_type = _partner_type
      AND (
        (p.id = _app_driving_school_id AND _partner_type = 'driving_school')
        OR (p.id = _app_medical_lab_id AND _partner_type = 'medical_lab')
        OR (p.id = _app_verification_agent_id AND _partner_type = 'verification_agent')
      )
  )
$$;

-- 3. Drop and recreate applications policies that have circular refs
DROP POLICY IF EXISTS "Drivers can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Drivers can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Drivers can update own pending applications" ON public.applications;

CREATE POLICY "Drivers can view own applications"
  ON public.applications
  FOR SELECT
  USING (public.driver_owns_application(auth.uid(), driver_id));

CREATE POLICY "Drivers can insert own applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (public.driver_owns_application(auth.uid(), driver_id));

CREATE POLICY "Drivers can update own pending applications"
  ON public.applications
  FOR UPDATE
  USING (status = 'pending' AND public.driver_owns_application(auth.uid(), driver_id));

-- 4. Drop and recreate partner policies on applications
DROP POLICY IF EXISTS "Driving schools can view assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Driving schools can update assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Medical labs can view assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Medical labs can update assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Verification agents can view assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Verification agents can update assigned applications" ON public.applications;

CREATE POLICY "Driving schools can view assigned applications"
  ON public.applications
  FOR SELECT
  USING (public.partner_can_access_application(auth.uid(), driving_school_id, NULL, NULL, 'driving_school'));

CREATE POLICY "Driving schools can update assigned applications"
  ON public.applications
  FOR UPDATE
  USING (public.partner_can_access_application(auth.uid(), driving_school_id, NULL, NULL, 'driving_school'));

CREATE POLICY "Medical labs can view assigned applications"
  ON public.applications
  FOR SELECT
  USING (public.partner_can_access_application(auth.uid(), NULL, medical_lab_id, NULL, 'medical_lab'));

CREATE POLICY "Medical labs can update assigned applications"
  ON public.applications
  FOR UPDATE
  USING (public.partner_can_access_application(auth.uid(), NULL, medical_lab_id, NULL, 'medical_lab'));

CREATE POLICY "Verification agents can view assigned applications"
  ON public.applications
  FOR SELECT
  USING (public.partner_can_access_application(auth.uid(), NULL, NULL, verification_agent_id, 'verification_agent'));

CREATE POLICY "Verification agents can update assigned applications"
  ON public.applications
  FOR UPDATE
  USING (public.partner_can_access_application(auth.uid(), NULL, NULL, verification_agent_id, 'verification_agent'));