-- Allow driving schools to delete test results for retest purposes
CREATE POLICY "Driving schools can delete results for retest" 
ON public.driving_test_results 
FOR DELETE 
USING (
  EXISTS ( 
    SELECT 1 FROM partners 
    WHERE partners.id = driving_test_results.driving_school_id 
    AND partners.user_id = auth.uid()
  )
);

-- Allow driving schools to delete traffic test sessions for retest
CREATE POLICY "Driving schools can delete own sessions" 
ON public.traffic_test_sessions 
FOR DELETE 
USING (
  EXISTS ( 
    SELECT 1 FROM partners 
    WHERE partners.id = traffic_test_sessions.driving_school_id 
    AND partners.user_id = auth.uid()
  )
);