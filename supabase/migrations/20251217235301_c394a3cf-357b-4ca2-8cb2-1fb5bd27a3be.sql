-- Fix infinite recursion by removing drivers<->applications RLS dependency.
-- Replace the enterprise drivers policy to use a SECURITY DEFINER function.

-- 1) Function: enterprise_can_view_driver
CREATE OR REPLACE FUNCTION public.enterprise_can_view_driver(_user_id uuid, _driver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.data_users du
    JOIN public.applications a
      ON a.driver_id = _driver_id
    WHERE du.user_id = _user_id
      AND a.status = 'approved'
      AND a.admin_approved = true
      AND a.certificate_number IS NOT NULL
  );
$$;

-- 2) Drop the recursive policy on drivers
DROP POLICY IF EXISTS "Company verifiers can view drivers for verified applications" ON public.drivers;

-- 3) Recreate policy using the function (no direct applications reference inside policy)
CREATE POLICY "Company verifiers can view drivers for verified applications"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.user_id = auth.uid()
    )
    AND public.enterprise_can_view_driver(auth.uid(), drivers.id)
  );