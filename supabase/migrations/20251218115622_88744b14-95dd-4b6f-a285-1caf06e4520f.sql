-- Fix infinite recursion in RLS policies for partners and applications tables

-- First, drop the problematic policies that cause circular references
DROP POLICY IF EXISTS "Drivers view assigned partners" ON public.partners;

-- Recreate the policy using a SECURITY DEFINER function to break the recursion
CREATE OR REPLACE FUNCTION public.driver_can_view_partner(_user_id uuid, _partner_id uuid)
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
    WHERE d.user_id = _user_id
      AND (a.driving_school_id = _partner_id 
           OR a.medical_lab_id = _partner_id 
           OR a.verification_agent_id = _partner_id)
  )
$$;

-- Recreate the policy using the function
CREATE POLICY "Drivers view assigned partners"
  ON public.partners
  FOR SELECT
  USING (
    status = 'active' 
    AND public.driver_can_view_partner(auth.uid(), id)
  );