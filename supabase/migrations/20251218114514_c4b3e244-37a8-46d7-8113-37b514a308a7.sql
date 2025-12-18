-- Fix: Remove anon access to applications table and use SECURITY DEFINER view instead

-- Step 1: Drop the overly permissive anon policy on applications table
DROP POLICY IF EXISTS "Public can verify approved certificates via view" ON public.applications;

-- Step 2: Drop the existing SECURITY INVOKER view
DROP VIEW IF EXISTS public.certificates_public;

-- Step 3: Create new SECURITY DEFINER view that doesn't require anon access to applications
CREATE VIEW public.certificates_public 
WITH (security_barrier = true)
AS SELECT 
  certificate_number,
  CASE 
    WHEN full_name IS NOT NULL AND LENGTH(full_name) > 2 
    THEN CONCAT(SUBSTRING(full_name FROM 1 FOR 1), '***', SUBSTRING(full_name FROM LENGTH(full_name) FOR 1))
    ELSE '***'
  END AS masked_name,
  certification_vehicle_class,
  skill_grade,
  certificate_expiry_date,
  created_at AS issue_date
FROM public.applications
WHERE status = 'approved' 
  AND admin_approved = true 
  AND certificate_number IS NOT NULL 
  AND certificate_status = 'active';

-- Step 4: Set view owner to postgres for SECURITY DEFINER behavior
ALTER VIEW public.certificates_public OWNER TO postgres;

-- Step 5: Grant SELECT on the view to anon role (view only, not underlying table)
GRANT SELECT ON public.certificates_public TO anon;
GRANT SELECT ON public.certificates_public TO authenticated;