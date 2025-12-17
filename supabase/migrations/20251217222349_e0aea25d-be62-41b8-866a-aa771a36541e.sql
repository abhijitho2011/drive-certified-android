-- Drop the existing check constraint that restricts status values
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add a new constraint that allows all needed status values
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'submitted', 'in_review', 'driving_test_completed', 'driving_test_failed', 'medical_test_completed', 'medical_test_failed', 'approved', 'rejected', 'certificate_issued'));