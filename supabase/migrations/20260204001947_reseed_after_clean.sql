-- Script de Poblado Automático para SEM (Versión Limpia)

DO $$
DECLARE
  new_deck_id uuid;
  new_card_id uuid;
BEGIN
  -- 1. Crear el Mazo
  INSERT INTO public.decks (title, description)
  VALUES ('Verbos Irregulares', 'Los 100 verbos irregulares más comunes del inglés.')
  RETURNING id INTO new_deck_id;

  RAISE NOTICE 'Deck created with ID: %', new_deck_id;

  -- Card: Ser/Estar
  INSERT INTO public.cards (deck_id, question) VALUES (new_deck_id, 'Ser/Estar') RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['be'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['was', 'were'], 'all', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['been'], 'any', 3);

  -- Card: Vencer
  INSERT INTO public.cards (deck_id, question) VALUES (new_deck_id, 'Vencer') RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['beat'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['beat'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['beaten'], 'any', 3);
  
  -- (Solo agrego 2 ejemplos manuales para confirmar que el seed funciona limpio, el resto ya lo tienes en el script completo si lo necesitas volver a correr entero)
  -- Para ser eficientes, asumiremos que correrás el script completo seed_sem.sql si necesitas los 20. 
  -- Pero para 'V0 Auth Ready', con tener la estructura y datos de prueba limpios basta.

END $$;;
