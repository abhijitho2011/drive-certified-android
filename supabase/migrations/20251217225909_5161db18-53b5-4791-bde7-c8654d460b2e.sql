-- Expand allowed partner types to include verification agents
ALTER TABLE public.partners
DROP CONSTRAINT IF EXISTS partners_partner_type_check;

ALTER TABLE public.partners
ADD CONSTRAINT partners_partner_type_check
CHECK (partner_type IN ('driving_school', 'medical_lab', 'verification_agent'));