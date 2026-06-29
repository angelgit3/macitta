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
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['be'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['was', 'were'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['been'], 3);

  -- Card: Vencer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Vencer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['beat'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['beat'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['beaten'], 3);

  -- Card: Convertirse
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Convertirse')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['become'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['became'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['become'], 3);

  -- Card: Empezar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Empezar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['begin'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['began'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['begun'], 3);

  -- Card: Morder
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Morder')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bite'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bit'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bitten'], 3);

  -- Card: Sangrar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Sangrar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bleed'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bled'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bled'], 3);

  -- Card: Soplar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Soplar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['blow'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['blew'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['blown'], 3);

  -- Card: Romper
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Romper')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['break'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['broke'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['broken'], 3);

  -- Card: Traer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Traer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['bring'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['brought'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['brought'], 3);

  -- Card: Construir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Construir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['build'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['built'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['built'], 3);

  -- Card: Quemar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Quemar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['burn'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['burned', 'burnt'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['burned', 'burnt'], 3);

  -- Card: Comprar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Comprar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['buy'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['bought'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['bought'], 3);

  -- Card: Atrapar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Atrapar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['catch'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['caught'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['caught'], 3);

  -- Card: Elegir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Elegir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['choose'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['chose'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['chosen'], 3);

  -- Card: Venir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Venir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['come'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['came'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['come'], 3);

  -- Card: Costar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Costar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['cost'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['cost'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['cost'], 3);

  -- Card: Cortar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Cortar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['cut'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['cut'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['cut'], 3);

  -- Card: Tratar/Repartir
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Tratar/Repartir')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['deal'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['dealt'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['dealt'], 3);

  -- Card: Hacer
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Hacer')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['do'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['did'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['done'], 3);

  -- Card: Dibujar
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, 'Dibujar')
  RETURNING id INTO new_card_id;
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Infinitivo', ARRAY['draw'], 1);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Simple', ARRAY['drew'], 2);
  INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index) VALUES (new_card_id, 'Pasado Participio', ARRAY['drawn'], 3);

END $$;
;
