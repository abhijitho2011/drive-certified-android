-- Fix all infinite recursion issues in RLS policies

-- 1. Drop problematic policies on drivers table
DROP POLICY IF EXISTS "Partners can view assigned drivers" ON public.drivers;

-- 2. Create a SECURITY DEFINER function for partners to check driver access
CREATE OR REPLACE FUNCTION public.partner_can_view_driver(_user_id uuid, _driver_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    JOIN partners p ON (p.id = a.driving_school_id OR p.id = a.medical_lab_id OR p.id = a.verification_agent_id)
    WHERE a.driver_id = _driver_id
      AND p.user_id = _user_id
  )
$$;

-- 3. Recreate the policy using the function
CREATE POLICY "Partners can view assigned drivers"
  ON public.drivers
  FOR SELECT
  USING (public.partner_can_view_driver(auth.uid(), id));