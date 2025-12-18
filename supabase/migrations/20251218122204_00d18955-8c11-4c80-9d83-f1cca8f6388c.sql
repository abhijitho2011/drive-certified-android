-- Add RLS policy to allow authenticated users to discover active partners
CREATE POLICY "Authenticated users can discover active partners"
ON public.partners
FOR SELECT
USING (
  status = 'active' 
  AND auth.uid() IS NOT NULL
);