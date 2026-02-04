
-- Script de Poblado Automático para SEM
-- Copia y pega esto en el SQL Editor de Supabase
-- IMPORTANTE: Asegúrate de haber corrido schema_sem.sql primero.

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
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Ser/Estar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['be'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['was', 'were'], 'all', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['been'], 'any', 3);

  -- Card: Vencer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Vencer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['beat'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['beat'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['beaten'], 'any', 3);

  -- Card: Convertirse
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Convertirse')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['become'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['became'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['become'], 'any', 3);

  -- Card: Empezar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Empezar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['begin'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['began'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['begun'], 'any', 3);

  -- Card: Morder
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Morder')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bite'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bit'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bitten'], 'any', 3);

  -- Card: Sangrar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Sangrar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bleed'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bled'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bled'], 'any', 3);

  -- Card: Soplar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Soplar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['blow'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['blew'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['blown'], 'any', 3);

  -- Card: Romper
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Romper')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['break'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['broke'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['broken'], 'any', 3);

  -- Card: Traer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Traer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bring'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['brought'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['brought'], 'any', 3);

  -- Card: Construir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Construir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['build'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['built'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['built'], 'any', 3);

  -- Card: Quemar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Quemar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['burn'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['burned', 'burnt'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['burned', 'burnt'], 'any', 3);

  -- Card: Comprar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Comprar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['buy'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bought'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bought'], 'any', 3);

  -- Card: Atrapar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Atrapar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['catch'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['caught'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['caught'], 'any', 3);

  -- Card: Elegir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Elegir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['choose'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['chose'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['chosen'], 'any', 3);

  -- Card: Venir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Venir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['come'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['came'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['come'], 'any', 3);

  -- Card: Costar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Costar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['cost'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['cost'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['cost'], 'any', 3);

  -- Card: Cortar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Cortar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['cut'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['cut'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['cut'], 'any', 3);

  -- Card: Tratar/Repartir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Tratar/Repartir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['deal'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['dealt'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['dealt'], 'any', 3);

  -- Card: Hacer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Hacer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['do'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['did'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['done'], 'any', 3);

  -- Card: Dibujar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Dibujar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['draw'], 'any', 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['drew'], 'any', 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['drawn'], 'any', 3);

END $$;
