-- ══════════════════════════════════════════════════════════
-- GetJobQuotes — Batch 3 Tables
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- Email waitlist
CREATE TABLE IF NOT EXISTS email_waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  source     text DEFAULT 'landing_page',
  created_at timestamptz DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  message    text NOT NULL,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Bug reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message    text NOT NULL,
  page_url   text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE email_waitlist   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports      ENABLE ROW LEVEL SECURITY;

-- email_waitlist — public insert, no read
DROP POLICY IF EXISTS "Anyone can join waitlist" ON email_waitlist;
CREATE POLICY "Anyone can join waitlist" ON email_waitlist
  FOR INSERT WITH CHECK (true);

-- contact_messages — public insert, no read
DROP POLICY IF EXISTS "Anyone can submit contact" ON contact_messages;
CREATE POLICY "Anyone can submit contact" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- bug_reports — authenticated insert only
DROP POLICY IF EXISTS "Users can report bugs" ON bug_reports;
CREATE POLICY "Users can report bugs" ON bug_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users see own reports" ON bug_reports;
CREATE POLICY "Users see own reports" ON bug_reports
  FOR SELECT USING (auth.uid() = user_id);

SELECT 'batch3 tables created' AS status;
