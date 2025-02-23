/*
  # Fix Database Schema Issues

  1. Changes
    - Create proper auth schema
    - Set up proper tables for authentication
    - Add necessary indexes and constraints

  2. Security
    - Ensure proper table permissions
    - Set up RLS policies
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create necessary auth tables if they don't exist
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    encrypted_password text,
    email_confirmed_at timestamptz,
    role text DEFAULT 'user',
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'users' 
        AND policyname = 'Allow full access for admin users'
    ) THEN
        CREATE POLICY "Allow full access for admin users" ON auth.users
            FOR ALL
            TO authenticated
            USING (raw_user_meta_data->>'role' = 'admin');
    END IF;
END $$;