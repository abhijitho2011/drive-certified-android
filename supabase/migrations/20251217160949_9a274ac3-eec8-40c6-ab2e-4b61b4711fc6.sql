-- For initial setup, allow any authenticated user to manage states/districts
-- This can be tightened later once admin user is created

DROP POLICY IF EXISTS "Admins can insert states" ON public.states;
DROP POLICY IF EXISTS "Admins can update states" ON public.states;
DROP POLICY IF EXISTS "Admins can delete states" ON public.states;
DROP POLICY IF EXISTS "Admins can insert districts" ON public.districts;
DROP POLICY IF EXISTS "Admins can update districts" ON public.districts;
DROP POLICY IF EXISTS "Admins can delete districts" ON public.districts;

-- Allow authenticated users to manage states
CREATE POLICY "Authenticated users can insert states" ON public.states 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update states" ON public.states 
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete states" ON public.states 
FOR DELETE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage districts
CREATE POLICY "Authenticated users can insert districts" ON public.districts 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update districts" ON public.districts 
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete districts" ON public.districts 
FOR DELETE USING (auth.uid() IS NOT NULL);