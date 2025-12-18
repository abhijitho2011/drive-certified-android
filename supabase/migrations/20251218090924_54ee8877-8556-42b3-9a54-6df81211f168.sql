-- Remove any remaining permissive policies on traffic_test_sessions
DROP POLICY IF EXISTS "Read non-expired sessions by credentials" ON public.traffic_test_sessions;
DROP POLICY IF EXISTS "Test takers can update non-expired sessions" ON public.traffic_test_sessions;

-- Drop and recreate the SELECT policy to ensure it's restrictive
DROP POLICY IF EXISTS "Driving schools can view own sessions" ON public.traffic_test_sessions;

-- Create restrictive SELECT policy - only authenticated driving schools and admins
CREATE POLICY "Driving schools can view own sessions"
  ON public.traffic_test_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partners 
      WHERE partners.id = traffic_test_sessions.driving_school_id 
      AND partners.user_id = auth.uid()
    )
  );

-- Ensure no UPDATE policy exists for anonymous users
-- All test submissions go through the Edge Function with secret_key validation