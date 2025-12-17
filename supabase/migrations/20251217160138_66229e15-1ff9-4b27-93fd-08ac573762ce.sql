-- Allow inserting driver role during signup
CREATE POLICY "Allow driver role insert during signup" ON public.user_roles 
FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'driver');