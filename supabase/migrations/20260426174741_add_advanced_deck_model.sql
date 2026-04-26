-- Add advanced deck model fields

-- 1. decks table
ALTER TABLE public.decks
ADD COLUMN color text DEFAULT NULL,
ADD COLUMN question_labels text[] DEFAULT '{}',
ADD COLUMN answer_labels text[] DEFAULT '{}';

-- 2. cards table
ALTER TABLE public.cards
RENAME COLUMN question TO front_text;

ALTER TABLE public.cards
ADD COLUMN front_media jsonb DEFAULT NULL;

-- 3. card_slots table
ALTER TABLE public.card_slots
ADD COLUMN advanced_rules jsonb DEFAULT NULL,
ADD COLUMN media jsonb DEFAULT NULL;
