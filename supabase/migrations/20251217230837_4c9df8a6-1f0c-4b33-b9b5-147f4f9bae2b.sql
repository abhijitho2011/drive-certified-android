-- Allow verification agents to read application documents from private storage bucket
-- (Needed for creating signed URLs / viewing uploaded docs in the verification portal)
CREATE POLICY "Verification agents can view application documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'application-documents'
  AND EXISTS (
    SELECT 1
    FROM public.partners
    WHERE partners.user_id = auth.uid()
      AND partners.partner_type = 'verification_agent'
  )
);
