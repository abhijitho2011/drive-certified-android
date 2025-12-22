-- Create job_postings table for enterprises to post job openings
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL REFERENCES data_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vehicle_class_required TEXT[],
  skill_grade_required TEXT[],
  availability_required TEXT CHECK (availability_required IN ('full_time', 'part_time', 'contract')),
  work_type TEXT CHECK (work_type IN ('delivery', 'taxi', 'truck', 'hazardous')),
  location TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  experience_years_min INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Employers can manage their job postings
CREATE POLICY "Employers can manage their job postings"
ON public.job_postings FOR ALL
USING (employer_id = get_employer_id(auth.uid()))
WITH CHECK (employer_id = get_employer_id(auth.uid()));

-- Admins can manage all job postings
CREATE POLICY "Admins can manage all job postings"
ON public.job_postings FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Drivers can view active job postings that match their qualifications
-- (filtering will be done in the query based on driver's certificates)
CREATE POLICY "Drivers can view matching active job postings"
ON public.job_postings FOR SELECT
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND EXISTS (
    SELECT 1 FROM drivers d WHERE d.user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_job_postings_updated_at
BEFORE UPDATE ON public.job_postings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();