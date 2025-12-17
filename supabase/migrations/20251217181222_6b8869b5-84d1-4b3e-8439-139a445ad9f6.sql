-- Add educational qualification column to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS highest_qualification text;

-- Add comment for documentation
COMMENT ON COLUMN public.applications.highest_qualification IS 'Highest educational qualification of the driver';