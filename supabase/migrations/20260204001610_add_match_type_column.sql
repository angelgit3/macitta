-- Add match_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'card_slots' AND column_name = 'match_type') THEN
        ALTER TABLE public.card_slots ADD COLUMN match_type text not null default 'any' check (match_type in ('any', 'all'));
    END IF;
END $$;;
