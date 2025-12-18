-- Fix all remaining circular RLS dependencies with SECURITY DEFINER functions

-- 1. Create function for drivers to check test result access
CREATE OR REPLACE FUNCTION public.driver_owns_test_result(_user_id uuid, _application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN drivers d ON a.driver_id = d.id
    WHERE a.id = _application_id
      AND d.user_id = _user_id
  )
$$;

-- 2. Drop and recreate driving_test_results policies that have circular refs
DROP POLICY IF EXISTS "Drivers can view own driving results" ON public.driving_test_results;

CREATE POLICY "Drivers can view own driving results"
  ON public.driving_test_results
  FOR SELECT
  USING (public.driver_owns_test_result(auth.uid(), application_id));

-- 3. Drop and recreate medical_test_results policies that have circular refs
DROP POLICY IF EXISTS "Drivers can view own medical results" ON public.medical_test_results;

CREATE POLICY "Drivers can view own medical results"
  ON public.medical_test_results
  FOR SELECT
  USING (public.driver_owns_test_result(auth.uid(), application_id));

-- 4. Create function for company verifiers to check app access
CREATE OR REPLACE FUNCTION public.company_can_view_app(_user_id uuid, _application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM data_users du
    JOIN applications a ON a.id = _application_id
    WHERE du.user_id = _user_id
      AND a.status = 'approved'
      AND a.admin_approved = true
      AND a.certificate_number IS NOT NULL
  )
$$;

-- 5. Fix company verifier policies for test results
DROP POLICY IF EXISTS "Company verifiers can view driving results for verified apps" ON public.driving_test_results;

CREATE POLICY "Company verifiers can view driving results for verified apps"
  ON public.driving_test_results
  FOR SELECT
  TO authenticated
  USING (public.company_can_view_app(auth.uid(), application_id));

DROP POLICY IF EXISTS "Company verifiers can view medical results for verified apps" ON public.medical_test_results;

CREATE POLICY "Company verifiers can view medical results for verified apps"
  ON public.medical_test_results
  FOR SELECT
  TO authenticated
  USING (public.company_can_view_app(auth.uid(), application_id));