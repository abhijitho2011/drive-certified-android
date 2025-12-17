-- Drop existing admin policies for states and districts
DROP POLICY IF EXISTS "Admins can manage states" ON public.states;
DROP POLICY IF EXISTS "Admins can manage districts" ON public.districts;

-- Create separate policies for each operation on states
CREATE POLICY "Admins can insert states" ON public.states 
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update states" ON public.states 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete states" ON public.states 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create separate policies for each operation on districts
CREATE POLICY "Admins can insert districts" ON public.districts 
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update districts" ON public.districts 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete districts" ON public.districts 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));