-- First, update RLS policies for states to admin-only
DROP POLICY IF EXISTS "Allow public insert states" ON public.states;
DROP POLICY IF EXISTS "Allow public update states" ON public.states;
DROP POLICY IF EXISTS "Allow public delete states" ON public.states;
DROP POLICY IF EXISTS "Allow public insert districts" ON public.districts;
DROP POLICY IF EXISTS "Allow public update districts" ON public.districts;
DROP POLICY IF EXISTS "Allow public delete districts" ON public.districts;

-- Create admin-only policies for states
CREATE POLICY "Admins can insert states" ON public.states 
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update states" ON public.states 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete states" ON public.states 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create admin-only policies for districts
CREATE POLICY "Admins can insert districts" ON public.districts 
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update districts" ON public.districts 
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete districts" ON public.districts 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create admin user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  phone,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  '+919895077492',
  NOW(),
  '{"provider": "phone", "providers": ["phone"]}',
  '{"first_name": "Admin", "last_name": "User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (phone) DO NOTHING
RETURNING id;

-- Insert admin role for the admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE phone = '+919895077492'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert admin profile
INSERT INTO public.profiles (id, phone, first_name, last_name)
SELECT id, '9895077492', 'Admin', 'User' FROM auth.users WHERE phone = '+919895077492'
ON CONFLICT (id) DO NOTHING;