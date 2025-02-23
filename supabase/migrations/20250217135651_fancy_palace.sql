/*
  # Set up admin authentication

  1. Changes
    - Create admin role policy for users table
    - Insert initial admin user

  2. Security
    - Enable RLS on auth.users
    - Add policy for admin access
*/

-- Create policy to identify admin users
CREATE POLICY "Allow full access for admin users" ON auth.users
  FOR ALL
  TO authenticated
  USING (raw_user_meta_data->>'role' = 'admin');

-- Insert admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@medstudyalgeria.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  NOW(),
  NOW()
);