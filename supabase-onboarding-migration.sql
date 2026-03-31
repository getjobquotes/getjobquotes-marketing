-- ══════════════════════════════════════════════════════════
-- GetJobQuotes — Onboarding State Table
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_onboarding_state (
  user_id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_business_profile boolean DEFAULT false,
  completed_first_customer   boolean DEFAULT false,
  completed_first_quote      boolean DEFAULT false,
  completed_first_invoice    boolean DEFAULT false,
  completed_first_send       boolean DEFAULT false,
  dismissed                  boolean DEFAULT false,
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own onboarding" ON user_onboarding_state;
CREATE POLICY "Users manage own onboarding" ON user_onboarding_state
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS onboarding_updated_at ON user_onboarding_state;
CREATE TRIGGER onboarding_updated_at
  BEFORE UPDATE ON user_onboarding_state
  FOR EACH ROW EXECUTE FUNCTION update_onboarding_updated_at();

-- Verify
SELECT 'user_onboarding_state created' AS status;
