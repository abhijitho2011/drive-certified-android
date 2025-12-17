-- Create company user roles enum
CREATE TYPE public.company_user_role AS ENUM ('admin', 'recruiter', 'compliance_officer');

-- Create company_users table for multiple users per company
CREATE TABLE public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_user_id UUID NOT NULL REFERENCES public.data_users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role company_user_role NOT NULL DEFAULT 'recruiter',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(data_user_id, email)
);

-- Create verification_logs table for audit trail
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_user_id UUID NOT NULL REFERENCES public.data_users(id) ON DELETE CASCADE,
  company_user_id UUID REFERENCES public.company_users(id) ON DELETE SET NULL,
  verified_by_name TEXT NOT NULL,
  verified_by_role TEXT,
  search_type TEXT NOT NULL, -- 'single' or 'bulk'
  search_query TEXT NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  certificate_number TEXT,
  driver_name TEXT,
  result_status TEXT NOT NULL, -- 'valid', 'invalid', 'expired', 'not_found'
  result_details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_users
CREATE POLICY "Admins can manage all company users"
  ON public.company_users FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Company admins can manage their company users"
  ON public.company_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.id = company_users.data_user_id
      AND du.user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can view their own record"
  ON public.company_users FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for verification_logs
CREATE POLICY "Admins can view all verification logs"
  ON public.verification_logs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Companies can manage their own logs"
  ON public.verification_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.data_users du
      WHERE du.id = verification_logs.data_user_id
      AND du.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_verification_logs_data_user ON public.verification_logs(data_user_id);
CREATE INDEX idx_verification_logs_created_at ON public.verification_logs(created_at DESC);
CREATE INDEX idx_company_users_data_user ON public.company_users(data_user_id);

-- Update trigger for company_users
CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON public.company_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();