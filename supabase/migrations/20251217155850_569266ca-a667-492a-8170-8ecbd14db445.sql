-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'driving_school', 'medical_lab', 'company_verifier');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create drivers (clients) table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create partners table (driving schools + medical labs)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('driving_school', 'medical_lab')),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  gst TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_users table (company verifiers)
CREATE TABLE public.data_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  district TEXT,
  state TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  driving_school_id UUID REFERENCES public.partners(id),
  medical_lab_id UUID REFERENCES public.partners(id),
  identity_verified BOOLEAN DEFAULT FALSE,
  driving_test_passed BOOLEAN DEFAULT FALSE,
  medical_test_passed BOOLEAN DEFAULT FALSE,
  education_verified BOOLEAN DEFAULT FALSE,
  admin_approved BOOLEAN DEFAULT FALSE,
  certificate_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow insert during signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers
CREATE POLICY "Drivers can view own data" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update own data" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all drivers" ON public.drivers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Allow driver insert during signup" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for partners
CREATE POLICY "Partners can view own data" ON public.partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can update own data" ON public.partners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all partners" ON public.partners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for data_users
CREATE POLICY "Data users can view own data" ON public.data_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Data users can update own data" ON public.data_users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all data users" ON public.data_users FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for applications
CREATE POLICY "Drivers can view own applications" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE drivers.id = applications.driver_id AND drivers.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all applications" ON public.applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can view assigned applications" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.partners WHERE partners.user_id = auth.uid() AND (partners.id = applications.driving_school_id OR partners.id = applications.medical_lab_id))
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_data_users_updated_at BEFORE UPDATE ON public.data_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();