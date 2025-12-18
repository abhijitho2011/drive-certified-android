-- Fix the security definer view issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.traffic_questions_public;

CREATE VIEW public.traffic_questions_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  category,
  image_url,
  is_hazardous_only,
  status
FROM public.traffic_law_questions
WHERE status = 'active';

-- Grant access to the view
GRANT SELECT ON public.traffic_questions_public TO authenticated, anon;