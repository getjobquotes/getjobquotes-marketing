-- Run in Supabase SQL Editor
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tour_completed boolean DEFAULT false;

SELECT 'tour_completed column added' AS status;
