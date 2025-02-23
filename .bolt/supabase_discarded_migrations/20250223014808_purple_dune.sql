/*
  # Fix admin user insertion

  1. Changes
    - Remove confirmed_at from INSERT statement as it's a generated column
    - Keep all other fields unchanged
*/

-- Insert admin user with proper schema
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