-- ══════════════════════════════════════════════════════════
-- GetJobQuotes — Preferences + Draft Autosave
-- Run in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- User preferences (one row per user, holds everything)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                text DEFAULT 'dark',          -- 'dark' | 'light'
  tour_completed       boolean DEFAULT false,
  onboarding_dismissed boolean DEFAULT false,
  default_vat          boolean DEFAULT false,
  last_dashboard_tab   text DEFAULT 'quotes',        -- 'quotes' | 'invoices'
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own prefs" ON user_preferences;
CREATE POLICY "Users manage own prefs" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Quote drafts (autosave — one active draft per user)
CREATE TABLE IF NOT EXISTS quote_drafts (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  draft       jsonb NOT NULL DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE quote_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own drafts" ON quote_drafts;
CREATE POLICY "Users manage own drafts" ON quote_drafts
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prefs_touch ON user_preferences;
CREATE TRIGGER prefs_touch BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS drafts_touch ON quote_drafts;
CREATE TRIGGER drafts_touch BEFORE UPDATE ON quote_drafts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Migrate existing tour_completed from profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='tour_completed') THEN
    INSERT INTO user_preferences (user_id, tour_completed)
    SELECT user_id, tour_completed FROM profiles
    ON CONFLICT (user_id) DO UPDATE SET tour_completed = EXCLUDED.tour_completed;
  END IF;
END $$;

SELECT 'user_preferences + quote_drafts created' AS status;
