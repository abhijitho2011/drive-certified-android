-- Create role-specific views for applications to enforce field-level access control
-- Each partner type only sees data relevant to their function

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.applications_driving_school;
DROP VIEW IF EXISTS public.applications_medical_lab;
DROP VIEW IF EXISTS public.applications_verification_agent;

-- View for Driving Schools: Identity verification + driving tests (NO medical data)
CREATE VIEW public.applications_driving_school
WITH (security_invoker = true)
AS SELECT 
  id,
  driver_id,
  driving_school_id,
  full_name,
  date_of_birth,
  gender,
  aadhaar_number, -- Needed for identity verification
  licence_number,
  licence_type,
  vehicle_classes,
  issuing_rto,
  licence_issue_date,
  licence_expiry_date,
  hazardous_endorsement,
  certification_vehicle_class,
  certification_purpose,
  driving_test_slot,
  driving_test_passed,
  driving_validity_date,
  skill_grade,
  identity_verified,
  status,
  notes,
  created_at,
  updated_at
FROM public.applications;

-- View for Medical Labs: Patient identification + medical tests (NO driving/licence data)
CREATE VIEW public.applications_medical_lab
WITH (security_invoker = true)
AS SELECT 
  id,
  driver_id,
  medical_lab_id,
  full_name,
  date_of_birth,
  gender,
  -- NO aadhaar_number for medical labs
  medical_test_slot,
  medical_test_passed,
  medical_validity_date,
  status,
  notes,
  created_at,
  updated_at
FROM public.applications;

-- View for Verification Agents: Education + identity documents (NO test results)
CREATE VIEW public.applications_verification_agent
WITH (security_invoker = true)
AS SELECT 
  id,
  driver_id,
  verification_agent_id,
  full_name,
  date_of_birth,
  gender,
  current_address,
  permanent_address,
  aadhaar_number, -- Needed for document verification
  highest_qualification,
  licence_number,
  licence_type,
  vehicle_classes,
  issuing_rto,
  licence_issue_date,
  licence_expiry_date,
  documents, -- Education certificates, ID docs
  education_verified,
  status,
  notes,
  created_at,
  updated_at
FROM public.applications;

-- Grant SELECT on views to authenticated users (RLS on base table controls access)
GRANT SELECT ON public.applications_driving_school TO authenticated;
GRANT SELECT ON public.applications_medical_lab TO authenticated;
GRANT SELECT ON public.applications_verification_agent TO authenticated;

-- Update RLS policies on applications table to be more restrictive for partners
-- Drop existing overly permissive partner policies
DROP POLICY IF EXISTS "Partners can view assigned applications" ON public.applications;
DROP POLICY IF EXISTS "Partners can update assigned applications" ON public.applications;

-- Create separate, restrictive policies for each partner type
-- Driving Schools can only view their assigned applications
CREATE POLICY "Driving schools can view assigned applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.driving_school_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'driving_school'
    )
  );

-- Driving Schools can update their assigned applications (test results)
CREATE POLICY "Driving schools can update assigned applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.driving_school_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'driving_school'
    )
  );

-- Medical Labs can only view their assigned applications
CREATE POLICY "Medical labs can view assigned applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.medical_lab_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'medical_lab'
    )
  );

-- Medical Labs can update their assigned applications (test results)
CREATE POLICY "Medical labs can update assigned applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.medical_lab_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'medical_lab'
    )
  );

-- Verification Agents can only view applications assigned to them
CREATE POLICY "Verification agents can view assigned applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.verification_agent_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'verification_agent'
    )
  );

-- Drop the old verification agent policies that allowed viewing ALL applications
DROP POLICY IF EXISTS "Verification agents can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Verification agents can update education verification" ON public.applications;

-- Verification Agents can update only their assigned applications
CREATE POLICY "Verification agents can update assigned applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE partners.id = applications.verification_agent_id
      AND partners.user_id = auth.uid()
      AND partners.partner_type = 'verification_agent'
    )
  );