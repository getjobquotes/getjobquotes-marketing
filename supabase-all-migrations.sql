-- Run ALL of these in Supabase SQL Editor

-- profiles additions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- documents additions
ALTER TABLE documents ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS share_token text UNIQUE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS accepted_by text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sent_at timestamptz;

-- customers table
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
DO $$ BEGIN
  CREATE POLICY "Users manage own customers" ON customers FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage policies for logos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
DO $$ BEGIN
  CREATE POLICY "Authenticated upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Public share token read (no auth needed for shared quote links)
DO $$ BEGIN
  CREATE POLICY "Public view shared documents" ON documents FOR SELECT USING (share_token IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN null; END $$;
