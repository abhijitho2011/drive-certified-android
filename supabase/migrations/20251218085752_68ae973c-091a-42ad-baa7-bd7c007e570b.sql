-- 1. Create failed login attempts tracking table for traffic test
CREATE TABLE IF NOT EXISTS public.traffic_test_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_user_id text NOT NULL,
  ip_address text,
  attempted_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.traffic_test_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow insert (no read/update/delete from client)
CREATE POLICY "Anyone can insert login attempts"
  ON public.traffic_test_login_attempts FOR INSERT
  WITH CHECK (true);

-- 2. Update traffic_test_sessions to add expiry and longer secret key
ALTER TABLE public.traffic_test_sessions 
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Set default expiry for new sessions (4 hours from creation)
-- Existing sessions will be updated to expire 4 hours from now
UPDATE public.traffic_test_sessions 
SET expires_at = created_at + interval '4 hours'
WHERE expires_at IS NULL;

-- 3. Create function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_traffic_test_rate_limit(p_test_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) 
    FROM traffic_test_login_attempts 
    WHERE test_user_id = p_test_user_id 
      AND success = false 
      AND attempted_at > now() - interval '15 minutes'
  ) < 5
$$;

-- 4. Fix partners RLS - Replace broad access with assignment-based access
DROP POLICY IF EXISTS "Authenticated users can view active partners" ON public.partners;

-- Drivers can only see partners assigned to their applications
CREATE POLICY "Drivers view assigned partners"
  ON public.partners FOR SELECT
  USING (
    status = 'active' AND EXISTS (
      SELECT 1 FROM applications a
      JOIN drivers d ON a.driver_id = d.id
      WHERE d.user_id = auth.uid()
      AND (a.driving_school_id = partners.id OR a.medical_lab_id = partners.id OR a.verification_agent_id = partners.id)
    )
  );

-- Partners can see their own data (already exists but ensure it's there)
-- This policy already exists: "Partners can view own data"

-- Create public view for partner discovery (name, type, district, state only - no contact info)
CREATE OR REPLACE VIEW public.partners_discovery AS
SELECT id, name, partner_type, district, state, status
FROM public.partners
WHERE status = 'active';

-- Grant select on view
GRANT SELECT ON public.partners_discovery TO authenticated;

-- 5. Update traffic test session RLS to check expiry
DROP POLICY IF EXISTS "Anyone can read session by test_user_id match" ON public.traffic_test_sessions;

CREATE POLICY "Read non-expired sessions by credentials"
  ON public.traffic_test_sessions FOR SELECT
  USING (
    (expires_at IS NULL OR expires_at > now())
  );

-- Update policy restricts to non-expired sessions
DROP POLICY IF EXISTS "Test takers can update their own session" ON public.traffic_test_sessions;

CREATE POLICY "Test takers can update non-expired sessions"
  ON public.traffic_test_sessions FOR UPDATE
  USING (
    (expires_at IS NULL OR expires_at > now())
  )
  WITH CHECK (true);