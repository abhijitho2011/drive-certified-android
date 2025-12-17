-- Allow authenticated users to view active partners for test center selection
CREATE POLICY "Authenticated users can view active partners"
ON public.partners
FOR SELECT
USING (status = 'active');