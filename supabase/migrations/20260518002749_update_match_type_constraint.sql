-- Drop the existing check constraint
ALTER TABLE public.card_slots
DROP CONSTRAINT IF EXISTS card_slots_match_type_check;

-- Add the new check constraint with the additional valid match types
ALTER TABLE public.card_slots
ADD CONSTRAINT card_slots_match_type_check 
CHECK (match_type IN ('any', 'all', 'exact', 'advanced'));;
