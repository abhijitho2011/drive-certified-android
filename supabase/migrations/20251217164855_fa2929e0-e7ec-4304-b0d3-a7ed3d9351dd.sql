-- Make phone column nullable in profiles since we're using email signup
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;