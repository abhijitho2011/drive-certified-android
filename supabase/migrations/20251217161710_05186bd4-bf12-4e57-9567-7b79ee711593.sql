-- Update admin user to have email authentication
UPDATE auth.users 
SET 
  email = 'admin@motract.com',
  email_confirmed_at = NOW(),
  encrypted_password = crypt('Admin@123', gen_salt('bf')),
  raw_app_meta_data = '{"provider": "email", "providers": ["email", "phone"]}'
WHERE phone = '+919895077492';