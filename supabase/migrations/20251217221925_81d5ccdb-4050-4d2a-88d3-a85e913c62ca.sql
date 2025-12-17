-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Driving schools can update unsubmitted results" ON public.driving_test_results;

-- Create new policy that allows updating unsubmitted results AND setting submitted_at
CREATE POLICY "Driving schools can update unsubmitted results" 
ON public.driving_test_results 
FOR UPDATE 
USING (
  (submitted_at IS NULL) AND 
  (EXISTS ( 
    SELECT 1 FROM partners 
    WHERE partners.id = driving_test_results.driving_school_id 
    AND partners.user_id = auth.uid()
  ))
)
WITH CHECK (
  EXISTS ( 
    SELECT 1 FROM partners 
    WHERE partners.id = driving_test_results.driving_school_id 
    AND partners.user_id = auth.uid()
  )
);