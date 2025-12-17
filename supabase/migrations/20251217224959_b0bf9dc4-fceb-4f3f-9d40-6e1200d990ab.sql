-- Add verification_agent to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'verification_agent';

-- Create education_verifications table to track verification status
CREATE TABLE public.education_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  verification_agent_id UUID NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.education_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for education_verifications
CREATE POLICY "Admins can manage all education verifications"
ON public.education_verifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Verification agents can view assigned verifications"
ON public.education_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.id = education_verifications.verification_agent_id
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Verification agents can update assigned verifications"
ON public.education_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.id = education_verifications.verification_agent_id
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Verification agents can insert verifications"
ON public.education_verifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.id = education_verifications.verification_agent_id
    AND partners.user_id = auth.uid()
  )
);

-- Add verification_agent_id to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS verification_agent_id UUID;

-- Update trigger for updated_at
CREATE TRIGGER update_education_verifications_updated_at
BEFORE UPDATE ON public.education_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow verification agents to view assigned applications
CREATE POLICY "Verification agents can view assigned applications"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.user_id = auth.uid()
    AND partners.id = applications.verification_agent_id
    AND partners.partner_type = 'verification_agent'
  )
);

-- Allow verification agents to update education_verified field
CREATE POLICY "Verification agents can update education verification"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM partners
    WHERE partners.user_id = auth.uid()
    AND partners.id = applications.verification_agent_id
    AND partners.partner_type = 'verification_agent'
  )
);