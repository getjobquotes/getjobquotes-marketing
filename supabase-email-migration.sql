-- Run in Supabase SQL Editor
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS last_view_notified timestamptz,
  ADD COLUMN IF NOT EXISTS last_reminder_sent timestamptz;

SELECT 'email columns added' AS status;
