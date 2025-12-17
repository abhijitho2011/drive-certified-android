-- Create states table
CREATE TABLE public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create districts table
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES public.states(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state_id, name)
);

-- Enable RLS
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read states and districts (public data)
CREATE POLICY "Anyone can view states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Anyone can view districts" ON public.districts FOR SELECT USING (true);

-- Only admins can manage states and districts
CREATE POLICY "Admins can manage states" ON public.states FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage districts" ON public.districts FOR ALL USING (public.has_role(auth.uid(), 'admin'));