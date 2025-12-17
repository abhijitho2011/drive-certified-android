-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

-- RLS policies for document uploads
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view assigned application documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'application-documents' AND EXISTS (
  SELECT 1 FROM applications a
  JOIN drivers d ON d.id = a.driver_id
  JOIN partners p ON p.id = a.driving_school_id OR p.id = a.medical_lab_id
  WHERE p.user_id = auth.uid()
  AND d.user_id::text = (storage.foldername(name))[1]
));

-- Add new columns to applications table for the comprehensive form
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS current_address text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS permanent_address text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS aadhaar_number text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS licence_number text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS issuing_rto text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS licence_issue_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS licence_expiry_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS licence_type text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS vehicle_classes text[];
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS hazardous_endorsement boolean DEFAULT false;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS certification_vehicle_class text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS certification_purpose text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{}';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS declaration_signed boolean DEFAULT false;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS declaration_date timestamp with time zone;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS test_state text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS test_district text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS driving_test_slot timestamp with time zone;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS medical_test_slot timestamp with time zone;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS skill_grade text;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS driving_validity_date date;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS medical_validity_date date;

-- Allow drivers to insert their own applications
CREATE POLICY "Drivers can insert own applications"
ON public.applications FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM drivers WHERE drivers.id = applications.driver_id AND drivers.user_id = auth.uid()
));

-- Allow drivers to update own pending applications
CREATE POLICY "Drivers can update own pending applications"
ON public.applications FOR UPDATE
USING (
  status = 'pending' AND 
  EXISTS (SELECT 1 FROM drivers WHERE drivers.id = applications.driver_id AND drivers.user_id = auth.uid())
);