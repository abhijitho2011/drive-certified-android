-- Add image_url column for questions that need images (like sign boards)
ALTER TABLE public.traffic_law_questions
ADD COLUMN image_url text;