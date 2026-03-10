-- Run this in your Supabase SQL editor

-- Business profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name text,
  business_email text,
  business_phone text,
  business_address text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON customers
  FOR ALL USING (auth.uid() = user_id);

-- Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS client_signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Storage bucket for logos (run in Supabase dashboard Storage)
-- Create bucket named: logos (public)
