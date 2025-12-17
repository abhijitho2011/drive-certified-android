-- Traffic Law Questions Table (Admin manages)
CREATE TABLE public.traffic_law_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  category TEXT NOT NULL DEFAULT 'general',
  is_hazardous_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Driving School Test Results Table
CREATE TABLE public.driving_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  driving_school_id UUID NOT NULL REFERENCES public.partners(id),
  
  -- Identity Verification (Gate Pass)
  identity_verified BOOLEAN DEFAULT false,
  identity_photo_match BOOLEAN,
  licence_verified BOOLEAN,
  police_clearance_verified BOOLEAN,
  verification_video_url TEXT,
  identity_status TEXT DEFAULT 'pending' CHECK (identity_status IN ('pending', 'verified', 'failed')),
  
  -- Traffic Law Test (20 points)
  traffic_test_score INTEGER,
  traffic_test_total INTEGER DEFAULT 20,
  traffic_test_answers JSONB DEFAULT '[]'::jsonb,
  traffic_test_passed BOOLEAN,
  
  -- Practical Driving Test (60 points)
  vehicle_control_score INTEGER DEFAULT 0 CHECK (vehicle_control_score >= 0 AND vehicle_control_score <= 20),
  parallel_parking_score INTEGER DEFAULT 0 CHECK (parallel_parking_score >= 0 AND parallel_parking_score <= 10),
  hill_driving_score INTEGER DEFAULT 0 CHECK (hill_driving_score >= 0 AND hill_driving_score <= 10),
  emergency_handling_score INTEGER DEFAULT 0 CHECK (emergency_handling_score >= 0 AND emergency_handling_score <= 10),
  defensive_driving_score INTEGER DEFAULT 0 CHECK (defensive_driving_score >= 0 AND defensive_driving_score <= 10),
  practical_test_total INTEGER DEFAULT 60,
  practical_test_passed BOOLEAN,
  practical_notes TEXT,
  
  -- Vehicle Inspection Test (20 points)
  brake_system_score INTEGER DEFAULT 0 CHECK (brake_system_score >= 0 AND brake_system_score <= 4),
  engine_fluids_score INTEGER DEFAULT 0 CHECK (engine_fluids_score >= 0 AND engine_fluids_score <= 4),
  tyres_score INTEGER DEFAULT 0 CHECK (tyres_score >= 0 AND tyres_score <= 4),
  lights_safety_score INTEGER DEFAULT 0 CHECK (lights_safety_score >= 0 AND lights_safety_score <= 4),
  diagnosis_score INTEGER DEFAULT 0 CHECK (diagnosis_score >= 0 AND diagnosis_score <= 4),
  inspection_test_total INTEGER DEFAULT 20,
  inspection_test_passed BOOLEAN,
  inspection_notes TEXT,
  
  -- Final Scores
  total_score INTEGER,
  skill_grade TEXT CHECK (skill_grade IN ('A', 'B', 'C', 'Fail')),
  overall_passed BOOLEAN DEFAULT false,
  
  tested_by TEXT,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(application_id)
);

-- Medical Lab Test Results Table
CREATE TABLE public.medical_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  medical_lab_id UUID NOT NULL REFERENCES public.partners(id),
  
  -- General Health Screening (Pass/Fail)
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  blood_pressure_status TEXT CHECK (blood_pressure_status IN ('normal', 'elevated', 'high', 'critical')),
  bmi DECIMAL(4,1),
  bmi_status TEXT CHECK (bmi_status IN ('underweight', 'normal', 'overweight', 'obese')),
  heart_rate INTEGER,
  heart_rate_status TEXT CHECK (heart_rate_status IN ('normal', 'abnormal')),
  vision_left TEXT,
  vision_right TEXT,
  vision_status TEXT CHECK (vision_status IN ('normal', 'corrected', 'impaired', 'failed')),
  color_blindness BOOLEAN DEFAULT false,
  hearing_status TEXT CHECK (hearing_status IN ('normal', 'mild_loss', 'moderate_loss', 'severe_loss')),
  health_screening_passed BOOLEAN,
  health_notes TEXT,
  
  -- Alcohol Screening
  alcohol_test_method TEXT CHECK (alcohol_test_method IN ('breath', 'blood', 'both')),
  alcohol_result TEXT CHECK (alcohol_result IN ('negative', 'positive', 'chronic_use')),
  alcohol_level DECIMAL(4,3),
  
  -- Drug Screening (30-day detection)
  drug_test_date DATE,
  cannabis_result TEXT DEFAULT 'pending' CHECK (cannabis_result IN ('pending', 'negative', 'positive')),
  opioids_result TEXT DEFAULT 'pending' CHECK (opioids_result IN ('pending', 'negative', 'positive')),
  cocaine_result TEXT DEFAULT 'pending' CHECK (cocaine_result IN ('pending', 'negative', 'positive')),
  amphetamines_result TEXT DEFAULT 'pending' CHECK (amphetamines_result IN ('pending', 'negative', 'positive')),
  methamphetamine_result TEXT DEFAULT 'pending' CHECK (methamphetamine_result IN ('pending', 'negative', 'positive')),
  mdma_result TEXT DEFAULT 'pending' CHECK (mdma_result IN ('pending', 'negative', 'positive')),
  benzodiazepines_result TEXT DEFAULT 'pending' CHECK (benzodiazepines_result IN ('pending', 'negative', 'positive')),
  barbiturates_result TEXT DEFAULT 'pending' CHECK (barbiturates_result IN ('pending', 'negative', 'positive')),
  drug_screening_passed BOOLEAN,
  drug_notes TEXT,
  
  -- Overall Medical Fitness
  fitness_status TEXT DEFAULT 'pending' CHECK (fitness_status IN ('pending', 'fit', 'conditionally_fit', 'unfit')),
  fitness_validity_months INTEGER DEFAULT 12,
  
  tested_by TEXT,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(application_id)
);

-- Enable RLS
ALTER TABLE public.traffic_law_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driving_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_test_results ENABLE ROW LEVEL SECURITY;

-- Traffic Law Questions Policies
CREATE POLICY "Anyone can view active questions" ON public.traffic_law_questions
FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage questions" ON public.traffic_law_questions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Driving Test Results Policies
CREATE POLICY "Driving schools can view assigned results" ON public.driving_test_results
FOR SELECT USING (
  EXISTS (SELECT 1 FROM partners WHERE id = driving_school_id AND user_id = auth.uid())
);

CREATE POLICY "Driving schools can insert results" ON public.driving_test_results
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM partners WHERE id = driving_school_id AND user_id = auth.uid())
);

CREATE POLICY "Driving schools can update unsubmitted results" ON public.driving_test_results
FOR UPDATE USING (
  submitted_at IS NULL AND
  EXISTS (SELECT 1 FROM partners WHERE id = driving_school_id AND user_id = auth.uid())
);

CREATE POLICY "Admins can manage all driving results" ON public.driving_test_results
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Medical Test Results Policies
CREATE POLICY "Medical labs can view assigned results" ON public.medical_test_results
FOR SELECT USING (
  EXISTS (SELECT 1 FROM partners WHERE id = medical_lab_id AND user_id = auth.uid())
);

CREATE POLICY "Medical labs can insert results" ON public.medical_test_results
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM partners WHERE id = medical_lab_id AND user_id = auth.uid())
);

CREATE POLICY "Medical labs can update unsubmitted results" ON public.medical_test_results
FOR UPDATE USING (
  submitted_at IS NULL AND
  EXISTS (SELECT 1 FROM partners WHERE id = medical_lab_id AND user_id = auth.uid())
);

CREATE POLICY "Admins can manage all medical results" ON public.medical_test_results
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Drivers can view their own test results
CREATE POLICY "Drivers can view own driving results" ON public.driving_test_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN drivers d ON a.driver_id = d.id
    WHERE a.id = application_id AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Drivers can view own medical results" ON public.medical_test_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN drivers d ON a.driver_id = d.id
    WHERE a.id = application_id AND d.user_id = auth.uid()
  )
);