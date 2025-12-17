-- Create traffic test sessions table for storing credentials
CREATE TABLE public.traffic_test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  driving_school_id UUID NOT NULL REFERENCES public.partners(id),
  test_user_id TEXT NOT NULL UNIQUE,
  secret_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  score INTEGER DEFAULT NULL,
  total_questions INTEGER DEFAULT 20,
  answers JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traffic_test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all traffic sessions"
ON public.traffic_test_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Driving schools can view own sessions"
ON public.traffic_test_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM partners 
  WHERE partners.id = traffic_test_sessions.driving_school_id 
  AND partners.user_id = auth.uid()
));

CREATE POLICY "Driving schools can create sessions"
ON public.traffic_test_sessions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM partners 
  WHERE partners.id = traffic_test_sessions.driving_school_id 
  AND partners.user_id = auth.uid()
));

-- Public read for test portal (with credentials)
CREATE POLICY "Public can read by test_user_id"
ON public.traffic_test_sessions FOR SELECT
USING (true);

CREATE POLICY "Public can update own session"
ON public.traffic_test_sessions FOR UPDATE
USING (true);

-- Enable realtime for traffic test sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_test_sessions;

-- Add index for credential lookup
CREATE INDEX idx_traffic_test_sessions_credentials ON public.traffic_test_sessions(test_user_id, secret_key);