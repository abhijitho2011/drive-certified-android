-- Create a secure view for public certificate verification
-- This view only exposes approved, active certificates with masked driver names
CREATE OR REPLACE VIEW public.certificates_public AS
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