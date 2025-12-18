-- Fix the SECURITY DEFINER view warning by dropping and recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.partners_discovery;

-- Recreate view with explicit SECURITY INVOKER (default but explicit is safer)
CREATE VIEW public.partners_discovery 
WITH (security_invoker = true)
AS
SELECT id, name, partner_type, district, state, status
FROM public.partners
WHERE status = 'active';

-- Grant select on view  
GRANT SELECT ON public.partners_discovery TO authenticated;