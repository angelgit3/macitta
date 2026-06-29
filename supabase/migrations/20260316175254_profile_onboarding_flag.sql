-- Add onboarding_done flag (idempotent - already added via execute_sql, this just records it in migrations)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_done boolean NOT NULL DEFAULT false;;
