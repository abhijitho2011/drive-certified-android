-- Fix: Replace SECURITY DEFINER view with RPC function for certificate verification

-- Step 1: Drop the SECURITY DEFINER view
DROP VIEW IF EXISTS public.certificates_public;

-- Step 2: Create a SECURITY DEFINER function for certificate lookup
-- This is the recommended pattern - functions are more controlled than views
CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS TABLE (
  certificate_number text,
  masked_name text,
  certification_vehicle_class text,
  skill_grade text,
  certificate_expiry_date date,
  issue_date timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.certificate_number,
    CASE 
      WHEN a.full_name IS NOT NULL AND LENGTH(a.full_name) > 2 
      THEN CONCAT(SUBSTRING(a.full_name FROM 1 FOR 1), '***', SUBSTRING(a.full_name FROM LENGTH(a.full_name) FOR 1))
      ELSE '***'
    END AS masked_name,
    a.certification_vehicle_class,
    a.skill_grade,
    a.certificate_expiry_date,
    a.created_at AS issue_date
  FROM public.applications a
  WHERE a.status = 'approved' 
    AND a.admin_approved = true 
    AND a.certificate_number IS NOT NULL 
    AND a.certificate_status = 'active'
    AND a.certificate_number = p_certificate_number
  LIMIT 1;
$$;

-- Step 3: Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO authenticated;