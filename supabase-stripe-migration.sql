ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status text;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON profiles(stripe_customer_id);

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('plan', 'stripe_customer_id', 'subscription_status');

-- Add onboarding_complete column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
