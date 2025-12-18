-- Fix: Set the view to use SECURITY INVOKER (default behavior)
-- Drop and recreate the view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.certificates_public;

CREATE VIEW public.certificates_public 
WITH (security_invoker = true)
AS
SELECT 
  certificate_number,
  -- Mask the driver name (show first letter + asterisks + last letter for each name part)
  CASE 
    WHEN full_name IS NOT NULL AND length(full_name) > 0 THEN
      (
        SELECT string_agg(
          CASE 
            WHEN length(word) <= 2 THEN repeat('*', length(word))
            ELSE substr(word, 1, 1) || repeat('*', length(word) - 2) || substr(word, length(word), 1)
          END,
          ' '
        )
        FROM unnest(string_to_array(full_name, ' ')) AS word
      )
    ELSE '***'
  END AS masked_name,
  certification_vehicle_class,
  skill_grade,
  certificate_expiry_date,
  created_at AS issue_date
FROM public.applications
WHERE 
  status = 'approved' 
  AND admin_approved = true 
  AND certificate_number IS NOT NULL 
  AND certificate_status = 'active';

-- Grant SELECT access to anon and authenticated roles
GRANT SELECT ON public.certificates_public TO anon;
GRANT SELECT ON public.certificates_public TO authenticated;

-- Create a permissive RLS policy on applications for anon users to read only public certificate data via the view
-- This is needed because SECURITY INVOKER means the view will use the querying user's permissions
CREATE POLICY "Public can verify approved certificates via view"
  ON public.applications FOR SELECT
  TO anon
  USING (
    status = 'approved' 
    AND admin_approved = true 
    AND certificate_number IS NOT NULL 
    AND certificate_status = 'active'
  );