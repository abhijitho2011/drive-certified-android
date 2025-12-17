-- Add certificate expiry tracking
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS certificate_expiry_date date,
ADD COLUMN IF NOT EXISTS certificate_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS renewal_type text; -- 'medical' or 'driving' or null

-- Add comment for clarity
COMMENT ON COLUMN public.applications.certificate_status IS 'active, expired, renewal_pending';
COMMENT ON COLUMN public.applications.renewal_type IS 'medical (annual), driving (license expired), null (no renewal needed)';