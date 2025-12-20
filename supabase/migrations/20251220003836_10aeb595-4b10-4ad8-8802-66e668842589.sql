-- Add recruitment_access to data_users for employer portal
ALTER TABLE public.data_users 
ADD COLUMN IF NOT EXISTS recruitment_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS industry_type TEXT,
ADD COLUMN IF NOT EXISTS recruitment_access_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recruitment_access_approved_by UUID;

-- Driver employment preferences and visibility
CREATE TABLE public.driver_employment_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'looking')) DEFAULT 'unemployed',
  availability TEXT CHECK (availability IN ('full_time', 'part_time', 'contract')),
  preferred_work_types TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  expected_salary_min NUMERIC,
  expected_salary_max NUMERIC,
  is_visible_to_employers BOOLEAN DEFAULT false,
  visibility_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employment history between drivers and employers
CREATE TABLE public.employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  employer_id UUID REFERENCES public.data_users(id) ON DELETE CASCADE NOT NULL,
  position TEXT,
  vehicle_class TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  termination_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance ratings from employers
CREATE TABLE public.performance_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employment_history_id UUID REFERENCES public.employment_history(id) ON DELETE CASCADE NOT NULL,
  employer_id UUID REFERENCES public.data_users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  behaviour_rating INTEGER CHECK (behaviour_rating BETWEEN 1 AND 5),
  vehicle_handling_rating INTEGER CHECK (vehicle_handling_rating BETWEEN 1 AND 5),
  overall_rating NUMERIC GENERATED ALWAYS AS (
    (COALESCE(punctuality_rating, 0) + COALESCE(safety_rating, 0) + COALESCE(behaviour_rating, 0) + COALESCE(vehicle_handling_rating, 0)) / 4.0
  ) STORED,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Experience certificates issued by employers
CREATE TABLE public.experience_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employment_history_id UUID REFERENCES public.employment_history(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  employer_id UUID REFERENCES public.data_users(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  vehicle_class TEXT NOT NULL,
  employment_duration_months INTEGER,
  performance_summary TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  verification_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job requests from employers to drivers
CREATE TABLE public.job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.data_users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  vehicle_class_required TEXT,
  location TEXT,
  salary_offered NUMERIC,
  work_type TEXT CHECK (work_type IN ('full_time', 'part_time', 'contract')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'hired')),
  driver_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Driver shortlist for employers
CREATE TABLE public.driver_shortlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.data_users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employer_id, driver_id)
);

-- Consent and audit logs for visibility changes
CREATE TABLE public.visibility_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('opt_in', 'opt_out')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rating disputes
CREATE TABLE public.rating_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_rating_id UUID REFERENCES public.performance_ratings(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.driver_employment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_shortlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_disputes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if employer has recruitment access
CREATE OR REPLACE FUNCTION public.employer_has_recruitment_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.data_users
    WHERE user_id = _user_id
      AND recruitment_access = true
      AND status = 'active'
  )
$$;

-- Helper function to get employer's data_user_id
CREATE OR REPLACE FUNCTION public.get_employer_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.data_users WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function to get driver_id from user_id
CREATE OR REPLACE FUNCTION public.get_driver_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.drivers WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function to check if driver is visible to employers
CREATE OR REPLACE FUNCTION public.driver_is_visible(_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_visible_to_employers FROM public.driver_employment_status WHERE driver_id = _driver_id),
    false
  )
$$;

-- RLS Policies for driver_employment_status
CREATE POLICY "Drivers can manage own employment status"
ON public.driver_employment_status FOR ALL
USING (driver_id = get_driver_id(auth.uid()))
WITH CHECK (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Admins can manage all employment status"
ON public.driver_employment_status FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can view visible drivers employment status"
ON public.driver_employment_status FOR SELECT
USING (
  employer_has_recruitment_access(auth.uid()) 
  AND is_visible_to_employers = true
);

-- RLS Policies for employment_history
CREATE POLICY "Drivers can view own employment history"
ON public.employment_history FOR SELECT
USING (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Employers can manage employment with their drivers"
ON public.employment_history FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

CREATE POLICY "Admins can manage all employment history"
ON public.employment_history FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_ratings
CREATE POLICY "Drivers can view own ratings"
ON public.performance_ratings FOR SELECT
USING (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Employers can manage ratings for their employees"
ON public.performance_ratings FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

CREATE POLICY "Admins can manage all ratings"
ON public.performance_ratings FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers with access can view visible driver ratings"
ON public.performance_ratings FOR SELECT
USING (
  employer_has_recruitment_access(auth.uid()) 
  AND driver_is_visible(driver_id)
);

-- RLS Policies for experience_certificates
CREATE POLICY "Drivers can view own certificates"
ON public.experience_certificates FOR SELECT
USING (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Employers can manage certificates for their employees"
ON public.experience_certificates FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

CREATE POLICY "Admins can manage all certificates"
ON public.experience_certificates FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_requests
CREATE POLICY "Drivers can view and respond to job requests"
ON public.job_requests FOR SELECT
USING (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Drivers can update job request status"
ON public.job_requests FOR UPDATE
USING (driver_id = get_driver_id(auth.uid()))
WITH CHECK (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Employers can manage their job requests"
ON public.job_requests FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

CREATE POLICY "Admins can manage all job requests"
ON public.job_requests FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for driver_shortlist
CREATE POLICY "Employers can manage their shortlist"
ON public.driver_shortlist FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

CREATE POLICY "Admins can view all shortlists"
ON public.driver_shortlist FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for visibility_consent_logs
CREATE POLICY "Drivers can insert own consent logs"
ON public.visibility_consent_logs FOR INSERT
WITH CHECK (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Drivers can view own consent logs"
ON public.visibility_consent_logs FOR SELECT
USING (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Admins can view all consent logs"
ON public.visibility_consent_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for rating_disputes
CREATE POLICY "Drivers can manage own disputes"
ON public.rating_disputes FOR ALL
USING (driver_id = get_driver_id(auth.uid()))
WITH CHECK (driver_id = get_driver_id(auth.uid()));

CREATE POLICY "Admins can manage all disputes"
ON public.rating_disputes FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_driver_employment_status_driver ON public.driver_employment_status(driver_id);
CREATE INDEX idx_driver_employment_status_visible ON public.driver_employment_status(is_visible_to_employers) WHERE is_visible_to_employers = true;
CREATE INDEX idx_employment_history_driver ON public.employment_history(driver_id);
CREATE INDEX idx_employment_history_employer ON public.employment_history(employer_id);
CREATE INDEX idx_performance_ratings_driver ON public.performance_ratings(driver_id);
CREATE INDEX idx_job_requests_driver ON public.job_requests(driver_id);
CREATE INDEX idx_job_requests_employer ON public.job_requests(employer_id);
CREATE INDEX idx_job_requests_status ON public.job_requests(status);
CREATE INDEX idx_driver_shortlist_employer ON public.driver_shortlist(employer_id);

-- Update triggers for updated_at
CREATE TRIGGER update_driver_employment_status_updated_at
BEFORE UPDATE ON public.driver_employment_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employment_history_updated_at
BEFORE UPDATE ON public.employment_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_requests_updated_at
BEFORE UPDATE ON public.job_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();