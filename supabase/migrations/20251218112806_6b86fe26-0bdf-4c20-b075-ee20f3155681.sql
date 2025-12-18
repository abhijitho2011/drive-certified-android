-- Update validate_traffic_answer function with strict input validation
CREATE OR REPLACE FUNCTION public.validate_traffic_answer(_question_id uuid, _selected_answer text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    -- First validate that the answer is one of A, B, C, D
    CASE WHEN _selected_answer ~ '^[A-D]$' THEN
      EXISTS (
        SELECT 1
        FROM public.traffic_law_questions
        WHERE id = _question_id
          AND correct_answer = _selected_answer
          AND status = 'active'
      )
    ELSE
      false
    END
$$;