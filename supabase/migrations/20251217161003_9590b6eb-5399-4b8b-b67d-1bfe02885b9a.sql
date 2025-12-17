-- Temporary: Allow public access to manage states/districts for testing
-- IMPORTANT: Tighten this once SMS auth is configured and admin user is created

DROP POLICY IF EXISTS "Authenticated users can insert states" ON public.states;
DROP POLICY IF EXISTS "Authenticated users can update states" ON public.states;
DROP POLICY IF EXISTS "Authenticated users can delete states" ON public.states;
DROP POLICY IF EXISTS "Authenticated users can insert districts" ON public.districts;
DROP POLICY IF EXISTS "Authenticated users can update districts" ON public.districts;
DROP POLICY IF EXISTS "Authenticated users can delete districts" ON public.districts;

-- Allow public insert/update/delete for testing
CREATE POLICY "Allow public insert states" ON public.states FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update states" ON public.states FOR UPDATE USING (true);
CREATE POLICY "Allow public delete states" ON public.states FOR DELETE USING (true);

CREATE POLICY "Allow public insert districts" ON public.districts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update districts" ON public.districts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete districts" ON public.districts FOR DELETE USING (true);