-- Migration SQL for 93 Verbs
BEGIN;

-- Clear existing cards for this mazo
DELETE FROM public.cards WHERE deck_id = 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2';

-- Card: Ser/Estar
INSERT INTO public.cards (id, deck_id, question) VALUES ('cb4eac35-6ced-4b2e-bcc6-01df9e253872', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Ser/Estar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cb4eac35-6ced-4b2e-bcc6-01df9e253872', 'Infinitivo', ARRAY['be'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cb4eac35-6ced-4b2e-bcc6-01df9e253872', 'Pasado Simple', ARRAY['was','were'], 1, 'all');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cb4eac35-6ced-4b2e-bcc6-01df9e253872', 'Pasado Participio', ARRAY['been'], 2, 'any');

-- Card: Vencer
INSERT INTO public.cards (id, deck_id, question) VALUES ('05ca4780-4ace-44da-a6ff-729e5ebfb9a8', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Vencer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('05ca4780-4ace-44da-a6ff-729e5ebfb9a8', 'Infinitivo', ARRAY['beat'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('05ca4780-4ace-44da-a6ff-729e5ebfb9a8', 'Pasado Simple', ARRAY['beat'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('05ca4780-4ace-44da-a6ff-729e5ebfb9a8', 'Pasado Participio', ARRAY['beaten'], 2, 'any');

-- Card: Convertirse
INSERT INTO public.cards (id, deck_id, question) VALUES ('57fa6e67-1a5a-40b6-b7c4-3e56db796608', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Convertirse');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57fa6e67-1a5a-40b6-b7c4-3e56db796608', 'Infinitivo', ARRAY['become'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57fa6e67-1a5a-40b6-b7c4-3e56db796608', 'Pasado Simple', ARRAY['became'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57fa6e67-1a5a-40b6-b7c4-3e56db796608', 'Pasado Participio', ARRAY['become'], 2, 'any');

-- Card: Empezar
INSERT INTO public.cards (id, deck_id, question) VALUES ('e0da4e64-de13-4ecd-b70a-d749ad964a7d', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Empezar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e0da4e64-de13-4ecd-b70a-d749ad964a7d', 'Infinitivo', ARRAY['begin'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e0da4e64-de13-4ecd-b70a-d749ad964a7d', 'Pasado Simple', ARRAY['began'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e0da4e64-de13-4ecd-b70a-d749ad964a7d', 'Pasado Participio', ARRAY['begun'], 2, 'any');

-- Card: Morder
INSERT INTO public.cards (id, deck_id, question) VALUES ('e5bf840c-db28-4de1-9057-bfbebfde1e29', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Morder');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5bf840c-db28-4de1-9057-bfbebfde1e29', 'Infinitivo', ARRAY['bite'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5bf840c-db28-4de1-9057-bfbebfde1e29', 'Pasado Simple', ARRAY['bit'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5bf840c-db28-4de1-9057-bfbebfde1e29', 'Pasado Participio', ARRAY['bitten'], 2, 'any');

-- Card: Sangrar
INSERT INTO public.cards (id, deck_id, question) VALUES ('a9916b8a-b98b-428d-8616-0be47d73fa36', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Sangrar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a9916b8a-b98b-428d-8616-0be47d73fa36', 'Infinitivo', ARRAY['bleed'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a9916b8a-b98b-428d-8616-0be47d73fa36', 'Pasado Simple', ARRAY['bled'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a9916b8a-b98b-428d-8616-0be47d73fa36', 'Pasado Participio', ARRAY['bled'], 2, 'any');

-- Card: Soplar
INSERT INTO public.cards (id, deck_id, question) VALUES ('289fafe6-8593-4c89-ba4d-38bcc740d9e4', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Soplar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('289fafe6-8593-4c89-ba4d-38bcc740d9e4', 'Infinitivo', ARRAY['blow'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('289fafe6-8593-4c89-ba4d-38bcc740d9e4', 'Pasado Simple', ARRAY['blew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('289fafe6-8593-4c89-ba4d-38bcc740d9e4', 'Pasado Participio', ARRAY['blown'], 2, 'any');

-- Card: Romper
INSERT INTO public.cards (id, deck_id, question) VALUES ('1a76d696-acb1-400a-b644-4f22fcd0999b', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Romper');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1a76d696-acb1-400a-b644-4f22fcd0999b', 'Infinitivo', ARRAY['break'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1a76d696-acb1-400a-b644-4f22fcd0999b', 'Pasado Simple', ARRAY['broke'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1a76d696-acb1-400a-b644-4f22fcd0999b', 'Pasado Participio', ARRAY['broken'], 2, 'any');

-- Card: Traer
INSERT INTO public.cards (id, deck_id, question) VALUES ('c6f2e1ed-1e51-4b9b-93f0-596a6853d3d7', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Traer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c6f2e1ed-1e51-4b9b-93f0-596a6853d3d7', 'Infinitivo', ARRAY['bring'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c6f2e1ed-1e51-4b9b-93f0-596a6853d3d7', 'Pasado Simple', ARRAY['brought'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c6f2e1ed-1e51-4b9b-93f0-596a6853d3d7', 'Pasado Participio', ARRAY['brought'], 2, 'any');

-- Card: Construir
INSERT INTO public.cards (id, deck_id, question) VALUES ('29a302cd-6661-486f-bd09-9af35781021b', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Construir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('29a302cd-6661-486f-bd09-9af35781021b', 'Infinitivo', ARRAY['build'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('29a302cd-6661-486f-bd09-9af35781021b', 'Pasado Simple', ARRAY['built'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('29a302cd-6661-486f-bd09-9af35781021b', 'Pasado Participio', ARRAY['built'], 2, 'any');

-- Card: Quemar
INSERT INTO public.cards (id, deck_id, question) VALUES ('b6920a9c-98e7-4a62-a2c1-7411c614a09c', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Quemar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b6920a9c-98e7-4a62-a2c1-7411c614a09c', 'Infinitivo', ARRAY['burn'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b6920a9c-98e7-4a62-a2c1-7411c614a09c', 'Pasado Simple', ARRAY['burned','burnt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b6920a9c-98e7-4a62-a2c1-7411c614a09c', 'Pasado Participio', ARRAY['burned','burnt'], 2, 'any');

-- Card: Comprar
INSERT INTO public.cards (id, deck_id, question) VALUES ('5ddf7b86-494b-4920-a2b9-5928cb5343c6', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Comprar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ddf7b86-494b-4920-a2b9-5928cb5343c6', 'Infinitivo', ARRAY['buy'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ddf7b86-494b-4920-a2b9-5928cb5343c6', 'Pasado Simple', ARRAY['bought'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ddf7b86-494b-4920-a2b9-5928cb5343c6', 'Pasado Participio', ARRAY['bought'], 2, 'any');

-- Card: Atrapar
INSERT INTO public.cards (id, deck_id, question) VALUES ('f71fe392-7958-4878-b6aa-9c716dbe3efe', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Atrapar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f71fe392-7958-4878-b6aa-9c716dbe3efe', 'Infinitivo', ARRAY['catch'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f71fe392-7958-4878-b6aa-9c716dbe3efe', 'Pasado Simple', ARRAY['caught'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f71fe392-7958-4878-b6aa-9c716dbe3efe', 'Pasado Participio', ARRAY['caught'], 2, 'any');

-- Card: Elegir
INSERT INTO public.cards (id, deck_id, question) VALUES ('b4cbeec1-91a1-4627-8cd9-dedc48e2e337', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Elegir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4cbeec1-91a1-4627-8cd9-dedc48e2e337', 'Infinitivo', ARRAY['choose'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4cbeec1-91a1-4627-8cd9-dedc48e2e337', 'Pasado Simple', ARRAY['chose'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4cbeec1-91a1-4627-8cd9-dedc48e2e337', 'Pasado Participio', ARRAY['chosen'], 2, 'any');

-- Card: Venir
INSERT INTO public.cards (id, deck_id, question) VALUES ('f805194d-96d7-4499-8fe0-fb3c7a46586c', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Venir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f805194d-96d7-4499-8fe0-fb3c7a46586c', 'Infinitivo', ARRAY['come'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f805194d-96d7-4499-8fe0-fb3c7a46586c', 'Pasado Simple', ARRAY['came'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f805194d-96d7-4499-8fe0-fb3c7a46586c', 'Pasado Participio', ARRAY['come'], 2, 'any');

-- Card: Costar
INSERT INTO public.cards (id, deck_id, question) VALUES ('41ac9b82-a1d5-4cdc-bb8e-1e06232eef39', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Costar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('41ac9b82-a1d5-4cdc-bb8e-1e06232eef39', 'Infinitivo', ARRAY['cost'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('41ac9b82-a1d5-4cdc-bb8e-1e06232eef39', 'Pasado Simple', ARRAY['cost'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('41ac9b82-a1d5-4cdc-bb8e-1e06232eef39', 'Pasado Participio', ARRAY['cost'], 2, 'any');

-- Card: Cortar
INSERT INTO public.cards (id, deck_id, question) VALUES ('bf32b69b-4528-44cf-af8d-3c89931eb3f9', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Cortar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf32b69b-4528-44cf-af8d-3c89931eb3f9', 'Infinitivo', ARRAY['cut'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf32b69b-4528-44cf-af8d-3c89931eb3f9', 'Pasado Simple', ARRAY['cut'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf32b69b-4528-44cf-af8d-3c89931eb3f9', 'Pasado Participio', ARRAY['cut'], 2, 'any');

-- Card: Tratar/Repartir
INSERT INTO public.cards (id, deck_id, question) VALUES ('921bea21-bcc5-47c6-80a7-c9c92933b978', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Tratar/Repartir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('921bea21-bcc5-47c6-80a7-c9c92933b978', 'Infinitivo', ARRAY['deal'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('921bea21-bcc5-47c6-80a7-c9c92933b978', 'Pasado Simple', ARRAY['dealt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('921bea21-bcc5-47c6-80a7-c9c92933b978', 'Pasado Participio', ARRAY['dealt'], 2, 'any');

-- Card: Hacer
INSERT INTO public.cards (id, deck_id, question) VALUES ('d964630d-f1d2-449f-9cf6-87078aefcb22', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Hacer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d964630d-f1d2-449f-9cf6-87078aefcb22', 'Infinitivo', ARRAY['do'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d964630d-f1d2-449f-9cf6-87078aefcb22', 'Pasado Simple', ARRAY['did'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d964630d-f1d2-449f-9cf6-87078aefcb22', 'Pasado Participio', ARRAY['done'], 2, 'any');

-- Card: Dibujar
INSERT INTO public.cards (id, deck_id, question) VALUES ('67e53435-ee5d-4faf-a03d-cdaf2e26cfe1', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Dibujar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('67e53435-ee5d-4faf-a03d-cdaf2e26cfe1', 'Infinitivo', ARRAY['draw'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('67e53435-ee5d-4faf-a03d-cdaf2e26cfe1', 'Pasado Simple', ARRAY['drew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('67e53435-ee5d-4faf-a03d-cdaf2e26cfe1', 'Pasado Participio', ARRAY['drawn'], 2, 'any');

-- Card: Beber
INSERT INTO public.cards (id, deck_id, question) VALUES ('b4e467de-7037-48e5-8cdc-f4487de5531f', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Beber');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4e467de-7037-48e5-8cdc-f4487de5531f', 'Infinitivo', ARRAY['drink'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4e467de-7037-48e5-8cdc-f4487de5531f', 'Pasado Simple', ARRAY['drank'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b4e467de-7037-48e5-8cdc-f4487de5531f', 'Pasado Participio', ARRAY['drunk'], 2, 'any');

-- Card: Conducir
INSERT INTO public.cards (id, deck_id, question) VALUES ('1671c1d2-ea0b-4620-8319-52bab7f48161', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Conducir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1671c1d2-ea0b-4620-8319-52bab7f48161', 'Infinitivo', ARRAY['drive'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1671c1d2-ea0b-4620-8319-52bab7f48161', 'Pasado Simple', ARRAY['drove'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1671c1d2-ea0b-4620-8319-52bab7f48161', 'Pasado Participio', ARRAY['driven'], 2, 'any');

-- Card: Comer
INSERT INTO public.cards (id, deck_id, question) VALUES ('36f9a427-22c2-4433-b01f-8215d9742d0d', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Comer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('36f9a427-22c2-4433-b01f-8215d9742d0d', 'Infinitivo', ARRAY['eat'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('36f9a427-22c2-4433-b01f-8215d9742d0d', 'Pasado Simple', ARRAY['ate'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('36f9a427-22c2-4433-b01f-8215d9742d0d', 'Pasado Participio', ARRAY['eaten'], 2, 'any');

-- Card: Caer
INSERT INTO public.cards (id, deck_id, question) VALUES ('b613137e-c19f-4fbb-b1cc-76d35a88ceac', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Caer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b613137e-c19f-4fbb-b1cc-76d35a88ceac', 'Infinitivo', ARRAY['fall'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b613137e-c19f-4fbb-b1cc-76d35a88ceac', 'Pasado Simple', ARRAY['fell'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b613137e-c19f-4fbb-b1cc-76d35a88ceac', 'Pasado Participio', ARRAY['fallen'], 2, 'any');

-- Card: Sentir
INSERT INTO public.cards (id, deck_id, question) VALUES ('d8b55fd3-0f00-438e-a9f7-58a91e883d04', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Sentir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d8b55fd3-0f00-438e-a9f7-58a91e883d04', 'Infinitivo', ARRAY['feel'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d8b55fd3-0f00-438e-a9f7-58a91e883d04', 'Pasado Simple', ARRAY['felt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d8b55fd3-0f00-438e-a9f7-58a91e883d04', 'Pasado Participio', ARRAY['felt'], 2, 'any');

-- Card: Pelear
INSERT INTO public.cards (id, deck_id, question) VALUES ('472475e8-4029-4fdd-ba61-e154877160f7', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Pelear');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('472475e8-4029-4fdd-ba61-e154877160f7', 'Infinitivo', ARRAY['fight'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('472475e8-4029-4fdd-ba61-e154877160f7', 'Pasado Simple', ARRAY['fought'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('472475e8-4029-4fdd-ba61-e154877160f7', 'Pasado Participio', ARRAY['fought'], 2, 'any');

-- Card: Encontrar
INSERT INTO public.cards (id, deck_id, question) VALUES ('f9e6f202-6664-4e0e-9599-87a193669461', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Encontrar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f9e6f202-6664-4e0e-9599-87a193669461', 'Infinitivo', ARRAY['find'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f9e6f202-6664-4e0e-9599-87a193669461', 'Pasado Simple', ARRAY['found'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f9e6f202-6664-4e0e-9599-87a193669461', 'Pasado Participio', ARRAY['found'], 2, 'any');

-- Card: Volar
INSERT INTO public.cards (id, deck_id, question) VALUES ('ad5e9329-0f2f-4181-8d7c-a066d5d7957d', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Volar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ad5e9329-0f2f-4181-8d7c-a066d5d7957d', 'Infinitivo', ARRAY['fly'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ad5e9329-0f2f-4181-8d7c-a066d5d7957d', 'Pasado Simple', ARRAY['flew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ad5e9329-0f2f-4181-8d7c-a066d5d7957d', 'Pasado Participio', ARRAY['flown'], 2, 'any');

-- Card: Olvidar
INSERT INTO public.cards (id, deck_id, question) VALUES ('3771ae30-f625-4e65-9b4e-6f273cc02155', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Olvidar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3771ae30-f625-4e65-9b4e-6f273cc02155', 'Infinitivo', ARRAY['forget'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3771ae30-f625-4e65-9b4e-6f273cc02155', 'Pasado Simple', ARRAY['forgot'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3771ae30-f625-4e65-9b4e-6f273cc02155', 'Pasado Participio', ARRAY['forgotten'], 2, 'any');

-- Card: Congelar
INSERT INTO public.cards (id, deck_id, question) VALUES ('3a496f02-5de0-41ea-ab68-95c3af20acdb', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Congelar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a496f02-5de0-41ea-ab68-95c3af20acdb', 'Infinitivo', ARRAY['freeze'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a496f02-5de0-41ea-ab68-95c3af20acdb', 'Pasado Simple', ARRAY['froze'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a496f02-5de0-41ea-ab68-95c3af20acdb', 'Pasado Participio', ARRAY['frozen'], 2, 'any');

-- Card: Obtener/Conseguir
INSERT INTO public.cards (id, deck_id, question) VALUES ('b7f05b20-e102-49a5-8eb5-fcbf549be1e6', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Obtener/Conseguir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b7f05b20-e102-49a5-8eb5-fcbf549be1e6', 'Infinitivo', ARRAY['get'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b7f05b20-e102-49a5-8eb5-fcbf549be1e6', 'Pasado Simple', ARRAY['got'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b7f05b20-e102-49a5-8eb5-fcbf549be1e6', 'Pasado Participio', ARRAY['gotten','got'], 2, 'any');

-- Card: Dar
INSERT INTO public.cards (id, deck_id, question) VALUES ('75901f83-5016-45eb-b6c1-b6aa595e2211', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Dar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('75901f83-5016-45eb-b6c1-b6aa595e2211', 'Infinitivo', ARRAY['give'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('75901f83-5016-45eb-b6c1-b6aa595e2211', 'Pasado Simple', ARRAY['gave'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('75901f83-5016-45eb-b6c1-b6aa595e2211', 'Pasado Participio', ARRAY['given'], 2, 'any');

-- Card: Ir
INSERT INTO public.cards (id, deck_id, question) VALUES ('fa6706b2-af14-4d91-97aa-815990cc5347', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Ir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fa6706b2-af14-4d91-97aa-815990cc5347', 'Infinitivo', ARRAY['go'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fa6706b2-af14-4d91-97aa-815990cc5347', 'Pasado Simple', ARRAY['went'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fa6706b2-af14-4d91-97aa-815990cc5347', 'Pasado Participio', ARRAY['gone'], 2, 'any');

-- Card: Crecer/Cultivar
INSERT INTO public.cards (id, deck_id, question) VALUES ('24d4af70-e15f-4803-a87a-59e24ea616ca', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Crecer/Cultivar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24d4af70-e15f-4803-a87a-59e24ea616ca', 'Infinitivo', ARRAY['grow'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24d4af70-e15f-4803-a87a-59e24ea616ca', 'Pasado Simple', ARRAY['grew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24d4af70-e15f-4803-a87a-59e24ea616ca', 'Pasado Participio', ARRAY['grown'], 2, 'any');

-- Card: Colgar
INSERT INTO public.cards (id, deck_id, question) VALUES ('16fd8312-58f1-472f-8f07-92c0225698e7', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Colgar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('16fd8312-58f1-472f-8f07-92c0225698e7', 'Infinitivo', ARRAY['hang'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('16fd8312-58f1-472f-8f07-92c0225698e7', 'Pasado Simple', ARRAY['hung'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('16fd8312-58f1-472f-8f07-92c0225698e7', 'Pasado Participio', ARRAY['hung'], 2, 'any');

-- Card: Tener
INSERT INTO public.cards (id, deck_id, question) VALUES ('f0a6a06d-076c-4f7f-8c38-07e4e4c237cd', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Tener');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f0a6a06d-076c-4f7f-8c38-07e4e4c237cd', 'Infinitivo', ARRAY['have'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f0a6a06d-076c-4f7f-8c38-07e4e4c237cd', 'Pasado Simple', ARRAY['had'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f0a6a06d-076c-4f7f-8c38-07e4e4c237cd', 'Pasado Participio', ARRAY['had'], 2, 'any');

-- Card: Oír
INSERT INTO public.cards (id, deck_id, question) VALUES ('bda12b1d-9aa2-4f88-bbc7-67c69ef854a2', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Oír');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bda12b1d-9aa2-4f88-bbc7-67c69ef854a2', 'Infinitivo', ARRAY['hear'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bda12b1d-9aa2-4f88-bbc7-67c69ef854a2', 'Pasado Simple', ARRAY['heard'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bda12b1d-9aa2-4f88-bbc7-67c69ef854a2', 'Pasado Participio', ARRAY['heard'], 2, 'any');

-- Card: Esconder
INSERT INTO public.cards (id, deck_id, question) VALUES ('7e8cd223-b90e-4d56-8e92-85e8123dd781', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Esconder');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('7e8cd223-b90e-4d56-8e92-85e8123dd781', 'Infinitivo', ARRAY['hide'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('7e8cd223-b90e-4d56-8e92-85e8123dd781', 'Pasado Simple', ARRAY['hid'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('7e8cd223-b90e-4d56-8e92-85e8123dd781', 'Pasado Participio', ARRAY['hidden'], 2, 'any');

-- Card: Golpear
INSERT INTO public.cards (id, deck_id, question) VALUES ('e4309f24-889e-431d-a4e9-167f6b652a6c', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Golpear');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e4309f24-889e-431d-a4e9-167f6b652a6c', 'Infinitivo', ARRAY['hit'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e4309f24-889e-431d-a4e9-167f6b652a6c', 'Pasado Simple', ARRAY['hit'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e4309f24-889e-431d-a4e9-167f6b652a6c', 'Pasado Participio', ARRAY['hit'], 2, 'any');

-- Card: Sostener/Abrazar
INSERT INTO public.cards (id, deck_id, question) VALUES ('e5d16b6c-df7f-411b-8dd9-c425b0baf2d1', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Sostener/Abrazar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5d16b6c-df7f-411b-8dd9-c425b0baf2d1', 'Infinitivo', ARRAY['hold'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5d16b6c-df7f-411b-8dd9-c425b0baf2d1', 'Pasado Simple', ARRAY['held'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e5d16b6c-df7f-411b-8dd9-c425b0baf2d1', 'Pasado Participio', ARRAY['held'], 2, 'any');

-- Card: Herir/Doler
INSERT INTO public.cards (id, deck_id, question) VALUES ('3af20bcc-11e1-4dda-a945-21a16861ab05', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Herir/Doler');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3af20bcc-11e1-4dda-a945-21a16861ab05', 'Infinitivo', ARRAY['hurt'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3af20bcc-11e1-4dda-a945-21a16861ab05', 'Pasado Simple', ARRAY['hurt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3af20bcc-11e1-4dda-a945-21a16861ab05', 'Pasado Participio', ARRAY['hurt'], 2, 'any');

-- Card: Guardar/Mantener
INSERT INTO public.cards (id, deck_id, question) VALUES ('947cf249-8a61-4997-99d5-0bf4c5ec17df', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Guardar/Mantener');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('947cf249-8a61-4997-99d5-0bf4c5ec17df', 'Infinitivo', ARRAY['keep'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('947cf249-8a61-4997-99d5-0bf4c5ec17df', 'Pasado Simple', ARRAY['kept'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('947cf249-8a61-4997-99d5-0bf4c5ec17df', 'Pasado Participio', ARRAY['kept'], 2, 'any');

-- Card: Saber/Conocer
INSERT INTO public.cards (id, deck_id, question) VALUES ('bee1b87f-5e63-4052-ba25-1604f289331c', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Saber/Conocer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bee1b87f-5e63-4052-ba25-1604f289331c', 'Infinitivo', ARRAY['know'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bee1b87f-5e63-4052-ba25-1604f289331c', 'Pasado Simple', ARRAY['knew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bee1b87f-5e63-4052-ba25-1604f289331c', 'Pasado Participio', ARRAY['known'], 2, 'any');

-- Card: Aprender
INSERT INTO public.cards (id, deck_id, question) VALUES ('d4bc7522-6f93-4070-8319-526884d57212', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Aprender');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d4bc7522-6f93-4070-8319-526884d57212', 'Infinitivo', ARRAY['learn'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d4bc7522-6f93-4070-8319-526884d57212', 'Pasado Simple', ARRAY['learned','learnt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('d4bc7522-6f93-4070-8319-526884d57212', 'Pasado Participio', ARRAY['learned','learnt'], 2, 'any');

-- Card: Dejar/Salir
INSERT INTO public.cards (id, deck_id, question) VALUES ('1bbca4ab-fc34-4762-baec-2de2cd7bf275', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Dejar/Salir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1bbca4ab-fc34-4762-baec-2de2cd7bf275', 'Infinitivo', ARRAY['leave'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1bbca4ab-fc34-4762-baec-2de2cd7bf275', 'Pasado Simple', ARRAY['left'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('1bbca4ab-fc34-4762-baec-2de2cd7bf275', 'Pasado Participio', ARRAY['left'], 2, 'any');

-- Card: Prestar
INSERT INTO public.cards (id, deck_id, question) VALUES ('f75907eb-5116-411a-84e4-05781d6299d9', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Prestar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f75907eb-5116-411a-84e4-05781d6299d9', 'Infinitivo', ARRAY['lend'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f75907eb-5116-411a-84e4-05781d6299d9', 'Pasado Simple', ARRAY['lent'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f75907eb-5116-411a-84e4-05781d6299d9', 'Pasado Participio', ARRAY['lent'], 2, 'any');

-- Card: Dejar/Permitir
INSERT INTO public.cards (id, deck_id, question) VALUES ('57dfebbb-b30a-4af2-ae40-ecb2cc45b62b', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Dejar/Permitir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57dfebbb-b30a-4af2-ae40-ecb2cc45b62b', 'Infinitivo', ARRAY['let'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57dfebbb-b30a-4af2-ae40-ecb2cc45b62b', 'Pasado Simple', ARRAY['let'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57dfebbb-b30a-4af2-ae40-ecb2cc45b62b', 'Pasado Participio', ARRAY['let'], 2, 'any');

-- Card: Yacer/Acostarse
INSERT INTO public.cards (id, deck_id, question) VALUES ('bb58e54a-f3b7-4a23-a7dd-064ec82358ab', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Yacer/Acostarse');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bb58e54a-f3b7-4a23-a7dd-064ec82358ab', 'Infinitivo', ARRAY['lie'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bb58e54a-f3b7-4a23-a7dd-064ec82358ab', 'Pasado Simple', ARRAY['lay'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bb58e54a-f3b7-4a23-a7dd-064ec82358ab', 'Pasado Participio', ARRAY['lain'], 2, 'any');

-- Card: Encender
INSERT INTO public.cards (id, deck_id, question) VALUES ('e308efe5-b424-4633-95d0-98209a589ed5', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Encender');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e308efe5-b424-4633-95d0-98209a589ed5', 'Infinitivo', ARRAY['light'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e308efe5-b424-4633-95d0-98209a589ed5', 'Pasado Simple', ARRAY['lit'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('e308efe5-b424-4633-95d0-98209a589ed5', 'Pasado Participio', ARRAY['lit'], 2, 'any');

-- Card: Perder
INSERT INTO public.cards (id, deck_id, question) VALUES ('52f2b83c-1ab0-4322-b84c-2cc07acfae19', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Perder');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('52f2b83c-1ab0-4322-b84c-2cc07acfae19', 'Infinitivo', ARRAY['lose'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('52f2b83c-1ab0-4322-b84c-2cc07acfae19', 'Pasado Simple', ARRAY['lost'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('52f2b83c-1ab0-4322-b84c-2cc07acfae19', 'Pasado Participio', ARRAY['lost'], 2, 'any');

-- Card: Hacer/Fabricar
INSERT INTO public.cards (id, deck_id, question) VALUES ('4da19397-7d1c-49b8-950f-194715847ca1', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Hacer/Fabricar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('4da19397-7d1c-49b8-950f-194715847ca1', 'Infinitivo', ARRAY['make'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('4da19397-7d1c-49b8-950f-194715847ca1', 'Pasado Simple', ARRAY['made'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('4da19397-7d1c-49b8-950f-194715847ca1', 'Pasado Participio', ARRAY['made'], 2, 'any');

-- Card: Significar
INSERT INTO public.cards (id, deck_id, question) VALUES ('07fa2009-0082-426e-914c-4749c07f3a57', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Significar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('07fa2009-0082-426e-914c-4749c07f3a57', 'Infinitivo', ARRAY['mean'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('07fa2009-0082-426e-914c-4749c07f3a57', 'Pasado Simple', ARRAY['meant'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('07fa2009-0082-426e-914c-4749c07f3a57', 'Pasado Participio', ARRAY['meant'], 2, 'any');

-- Card: Conocer/Reunirse
INSERT INTO public.cards (id, deck_id, question) VALUES ('396f1abf-168c-476d-b9ef-3c88a626f860', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Conocer/Reunirse');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('396f1abf-168c-476d-b9ef-3c88a626f860', 'Infinitivo', ARRAY['meet'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('396f1abf-168c-476d-b9ef-3c88a626f860', 'Pasado Simple', ARRAY['met'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('396f1abf-168c-476d-b9ef-3c88a626f860', 'Pasado Participio', ARRAY['met'], 2, 'any');

-- Card: Segar/Cortar césped
INSERT INTO public.cards (id, deck_id, question) VALUES ('0a6a7517-1366-4e19-b175-872ced1b62f0', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Segar/Cortar césped');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0a6a7517-1366-4e19-b175-872ced1b62f0', 'Infinitivo', ARRAY['mow'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0a6a7517-1366-4e19-b175-872ced1b62f0', 'Pasado Simple', ARRAY['mowed'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0a6a7517-1366-4e19-b175-872ced1b62f0', 'Pasado Participio', ARRAY['mowed','mown'], 2, 'any');

-- Card: Pagar
INSERT INTO public.cards (id, deck_id, question) VALUES ('bf386dd2-7d5d-4448-8e91-9a9ca5138271', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Pagar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf386dd2-7d5d-4448-8e91-9a9ca5138271', 'Infinitivo', ARRAY['pay'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf386dd2-7d5d-4448-8e91-9a9ca5138271', 'Pasado Simple', ARRAY['paid'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('bf386dd2-7d5d-4448-8e91-9a9ca5138271', 'Pasado Participio', ARRAY['paid'], 2, 'any');

-- Card: Poner
INSERT INTO public.cards (id, deck_id, question) VALUES ('3a063629-b2e6-4b16-b372-198439529ed2', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Poner');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a063629-b2e6-4b16-b372-198439529ed2', 'Infinitivo', ARRAY['put'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a063629-b2e6-4b16-b372-198439529ed2', 'Pasado Simple', ARRAY['put'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3a063629-b2e6-4b16-b372-198439529ed2', 'Pasado Participio', ARRAY['put'], 2, 'any');

-- Card: Leer
INSERT INTO public.cards (id, deck_id, question) VALUES ('dd7a3a28-75bb-43eb-b5b8-a38102ae8701', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Leer');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd7a3a28-75bb-43eb-b5b8-a38102ae8701', 'Infinitivo', ARRAY['read'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd7a3a28-75bb-43eb-b5b8-a38102ae8701', 'Pasado Simple', ARRAY['read'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd7a3a28-75bb-43eb-b5b8-a38102ae8701', 'Pasado Participio', ARRAY['read'], 2, 'any');

-- Card: Montar/Andar
INSERT INTO public.cards (id, deck_id, question) VALUES ('ded4184c-8385-4091-91e9-73e6e7325939', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Montar/Andar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ded4184c-8385-4091-91e9-73e6e7325939', 'Infinitivo', ARRAY['ride'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ded4184c-8385-4091-91e9-73e6e7325939', 'Pasado Simple', ARRAY['rode'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ded4184c-8385-4091-91e9-73e6e7325939', 'Pasado Participio', ARRAY['ridden'], 2, 'any');

-- Card: Sonear/Llamar
INSERT INTO public.cards (id, deck_id, question) VALUES ('5ec51431-33dc-4814-a948-de72ec23d9b3', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Sonear/Llamar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ec51431-33dc-4814-a948-de72ec23d9b3', 'Infinitivo', ARRAY['ring'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ec51431-33dc-4814-a948-de72ec23d9b3', 'Pasado Simple', ARRAY['rang'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5ec51431-33dc-4814-a948-de72ec23d9b3', 'Pasado Participio', ARRAY['rung'], 2, 'any');

-- Card: Elevarse/Subir
INSERT INTO public.cards (id, deck_id, question) VALUES ('697274cd-1516-4ffc-9da8-2d6cc88031a5', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Elevarse/Subir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('697274cd-1516-4ffc-9da8-2d6cc88031a5', 'Infinitivo', ARRAY['rise'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('697274cd-1516-4ffc-9da8-2d6cc88031a5', 'Pasado Simple', ARRAY['rose'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('697274cd-1516-4ffc-9da8-2d6cc88031a5', 'Pasado Participio', ARRAY['risen'], 2, 'any');

-- Card: Correr
INSERT INTO public.cards (id, deck_id, question) VALUES ('18c09c22-03df-4d6a-8ad3-b75c6e06655f', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Correr');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('18c09c22-03df-4d6a-8ad3-b75c6e06655f', 'Infinitivo', ARRAY['run'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('18c09c22-03df-4d6a-8ad3-b75c6e06655f', 'Pasado Simple', ARRAY['ran'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('18c09c22-03df-4d6a-8ad3-b75c6e06655f', 'Pasado Participio', ARRAY['run'], 2, 'any');

-- Card: Decir
INSERT INTO public.cards (id, deck_id, question) VALUES ('c4dbda06-e19c-4683-aa3f-d978d68a9274', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Decir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c4dbda06-e19c-4683-aa3f-d978d68a9274', 'Infinitivo', ARRAY['say'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c4dbda06-e19c-4683-aa3f-d978d68a9274', 'Pasado Simple', ARRAY['said'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('c4dbda06-e19c-4683-aa3f-d978d68a9274', 'Pasado Participio', ARRAY['said'], 2, 'any');

-- Card: Ver
INSERT INTO public.cards (id, deck_id, question) VALUES ('f6251147-e45c-4704-b7b3-0596daa10534', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Ver');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f6251147-e45c-4704-b7b3-0596daa10534', 'Infinitivo', ARRAY['see'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f6251147-e45c-4704-b7b3-0596daa10534', 'Pasado Simple', ARRAY['saw'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f6251147-e45c-4704-b7b3-0596daa10534', 'Pasado Participio', ARRAY['seen'], 2, 'any');

-- Card: Vender
INSERT INTO public.cards (id, deck_id, question) VALUES ('81e61da1-8e2d-4c12-88f9-3529227ca5c7', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Vender');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('81e61da1-8e2d-4c12-88f9-3529227ca5c7', 'Infinitivo', ARRAY['sell'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('81e61da1-8e2d-4c12-88f9-3529227ca5c7', 'Pasado Simple', ARRAY['sold'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('81e61da1-8e2d-4c12-88f9-3529227ca5c7', 'Pasado Participio', ARRAY['sold'], 2, 'any');

-- Card: Enviar
INSERT INTO public.cards (id, deck_id, question) VALUES ('95cc82cd-57c8-49ea-8f25-453a1eef67fd', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Enviar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('95cc82cd-57c8-49ea-8f25-453a1eef67fd', 'Infinitivo', ARRAY['send'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('95cc82cd-57c8-49ea-8f25-453a1eef67fd', 'Pasado Simple', ARRAY['sent'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('95cc82cd-57c8-49ea-8f25-453a1eef67fd', 'Pasado Participio', ARRAY['sent'], 2, 'any');

-- Card: Poner/Colocar
INSERT INTO public.cards (id, deck_id, question) VALUES ('2633f985-0c2a-4e7f-a1f7-6fbaf58d416d', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Poner/Colocar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2633f985-0c2a-4e7f-a1f7-6fbaf58d416d', 'Infinitivo', ARRAY['set'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2633f985-0c2a-4e7f-a1f7-6fbaf58d416d', 'Pasado Simple', ARRAY['set'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2633f985-0c2a-4e7f-a1f7-6fbaf58d416d', 'Pasado Participio', ARRAY['set'], 2, 'any');

-- Card: Agitar/Sacudir
INSERT INTO public.cards (id, deck_id, question) VALUES ('dd9ed9d9-930c-4c09-8c96-6d74a7d41ccb', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Agitar/Sacudir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd9ed9d9-930c-4c09-8c96-6d74a7d41ccb', 'Infinitivo', ARRAY['shake'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd9ed9d9-930c-4c09-8c96-6d74a7d41ccb', 'Pasado Simple', ARRAY['shook'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('dd9ed9d9-930c-4c09-8c96-6d74a7d41ccb', 'Pasado Participio', ARRAY['shaken'], 2, 'any');

-- Card: Brillar
INSERT INTO public.cards (id, deck_id, question) VALUES ('f5407725-10d4-44ab-a069-f539d21d94ad', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Brillar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5407725-10d4-44ab-a069-f539d21d94ad', 'Infinitivo', ARRAY['shine'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5407725-10d4-44ab-a069-f539d21d94ad', 'Pasado Simple', ARRAY['shone'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5407725-10d4-44ab-a069-f539d21d94ad', 'Pasado Participio', ARRAY['shone'], 2, 'any');

-- Card: Disparar
INSERT INTO public.cards (id, deck_id, question) VALUES ('b998bdd2-e8fc-414e-a346-e644debb5c26', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Disparar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b998bdd2-e8fc-414e-a346-e644debb5c26', 'Infinitivo', ARRAY['shoot'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b998bdd2-e8fc-414e-a346-e644debb5c26', 'Pasado Simple', ARRAY['shot'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('b998bdd2-e8fc-414e-a346-e644debb5c26', 'Pasado Participio', ARRAY['shot'], 2, 'any');

-- Card: Mostrar
INSERT INTO public.cards (id, deck_id, question) VALUES ('203c0951-4d62-4397-8e08-e01c70eecc99', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Mostrar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('203c0951-4d62-4397-8e08-e01c70eecc99', 'Infinitivo', ARRAY['show'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('203c0951-4d62-4397-8e08-e01c70eecc99', 'Pasado Simple', ARRAY['showed'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('203c0951-4d62-4397-8e08-e01c70eecc99', 'Pasado Participio', ARRAY['shown'], 2, 'any');

-- Card: Cantar
INSERT INTO public.cards (id, deck_id, question) VALUES ('a43aef41-2425-445a-8612-38a3e1834836', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Cantar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a43aef41-2425-445a-8612-38a3e1834836', 'Infinitivo', ARRAY['sing'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a43aef41-2425-445a-8612-38a3e1834836', 'Pasado Simple', ARRAY['sang'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a43aef41-2425-445a-8612-38a3e1834836', 'Pasado Participio', ARRAY['sung'], 2, 'any');

-- Card: Sentarse
INSERT INTO public.cards (id, deck_id, question) VALUES ('fe1a08f9-7313-4abc-b30d-d1860f818d6a', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Sentarse');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fe1a08f9-7313-4abc-b30d-d1860f818d6a', 'Infinitivo', ARRAY['sit'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fe1a08f9-7313-4abc-b30d-d1860f818d6a', 'Pasado Simple', ARRAY['sat'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('fe1a08f9-7313-4abc-b30d-d1860f818d6a', 'Pasado Participio', ARRAY['sat'], 2, 'any');

-- Card: Dormir
INSERT INTO public.cards (id, deck_id, question) VALUES ('f5088b2e-306d-4455-8b5b-8bc28aec373f', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Dormir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5088b2e-306d-4455-8b5b-8bc28aec373f', 'Infinitivo', ARRAY['sleep'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5088b2e-306d-4455-8b5b-8bc28aec373f', 'Pasado Simple', ARRAY['slept'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('f5088b2e-306d-4455-8b5b-8bc28aec373f', 'Pasado Participio', ARRAY['slept'], 2, 'any');

-- Card: Oler
INSERT INTO public.cards (id, deck_id, question) VALUES ('a11011c6-3932-4860-b0be-2f068be9ad29', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Oler');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a11011c6-3932-4860-b0be-2f068be9ad29', 'Infinitivo', ARRAY['smell'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a11011c6-3932-4860-b0be-2f068be9ad29', 'Pasado Simple', ARRAY['smelled','smelt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('a11011c6-3932-4860-b0be-2f068be9ad29', 'Pasado Participio', ARRAY['smelled','smelt'], 2, 'any');

-- Card: Hablar
INSERT INTO public.cards (id, deck_id, question) VALUES ('2bb6ac69-c478-4de2-af38-e8b3830f87fc', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Hablar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2bb6ac69-c478-4de2-af38-e8b3830f87fc', 'Infinitivo', ARRAY['speak'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2bb6ac69-c478-4de2-af38-e8b3830f87fc', 'Pasado Simple', ARRAY['spoke'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('2bb6ac69-c478-4de2-af38-e8b3830f87fc', 'Pasado Participio', ARRAY['spoken'], 2, 'any');

-- Card: Deletrear
INSERT INTO public.cards (id, deck_id, question) VALUES ('cee7266f-397b-4dc0-8d8f-c682f22fb0e5', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Deletrear');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cee7266f-397b-4dc0-8d8f-c682f22fb0e5', 'Infinitivo', ARRAY['spell'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cee7266f-397b-4dc0-8d8f-c682f22fb0e5', 'Pasado Simple', ARRAY['spelled','spelt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('cee7266f-397b-4dc0-8d8f-c682f22fb0e5', 'Pasado Participio', ARRAY['spelled','spelt'], 2, 'any');

-- Card: Gastar/Pasar
INSERT INTO public.cards (id, deck_id, question) VALUES ('24143891-dc12-40d8-b928-96986fecf858', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Gastar/Pasar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24143891-dc12-40d8-b928-96986fecf858', 'Infinitivo', ARRAY['spend'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24143891-dc12-40d8-b928-96986fecf858', 'Pasado Simple', ARRAY['spent'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('24143891-dc12-40d8-b928-96986fecf858', 'Pasado Participio', ARRAY['spent'], 2, 'any');

-- Card: Derramar
INSERT INTO public.cards (id, deck_id, question) VALUES ('0815d6b3-cfdc-4c78-95ac-d9cb3d38cb35', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Derramar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0815d6b3-cfdc-4c78-95ac-d9cb3d38cb35', 'Infinitivo', ARRAY['spill'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0815d6b3-cfdc-4c78-95ac-d9cb3d38cb35', 'Pasado Simple', ARRAY['spilled','spilt'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('0815d6b3-cfdc-4c78-95ac-d9cb3d38cb35', 'Pasado Participio', ARRAY['spilled','spilt'], 2, 'any');

-- Card: Estar de pie
INSERT INTO public.cards (id, deck_id, question) VALUES ('43fd01da-62c5-45e0-84e0-c18f2449af4e', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Estar de pie');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('43fd01da-62c5-45e0-84e0-c18f2449af4e', 'Infinitivo', ARRAY['stand'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('43fd01da-62c5-45e0-84e0-c18f2449af4e', 'Pasado Simple', ARRAY['stood'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('43fd01da-62c5-45e0-84e0-c18f2449af4e', 'Pasado Participio', ARRAY['stood'], 2, 'any');

-- Card: Robar
INSERT INTO public.cards (id, deck_id, question) VALUES ('22fe0d1a-b4ee-4bfa-b92f-27350ee35da2', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Robar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('22fe0d1a-b4ee-4bfa-b92f-27350ee35da2', 'Infinitivo', ARRAY['steal'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('22fe0d1a-b4ee-4bfa-b92f-27350ee35da2', 'Pasado Simple', ARRAY['stole'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('22fe0d1a-b4ee-4bfa-b92f-27350ee35da2', 'Pasado Participio', ARRAY['stolen'], 2, 'any');

-- Card: Picar
INSERT INTO public.cards (id, deck_id, question) VALUES ('45676cfe-503f-48f8-bb44-15a4a8581a82', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Picar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('45676cfe-503f-48f8-bb44-15a4a8581a82', 'Infinitivo', ARRAY['sting'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('45676cfe-503f-48f8-bb44-15a4a8581a82', 'Pasado Simple', ARRAY['stung'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('45676cfe-503f-48f8-bb44-15a4a8581a82', 'Pasado Participio', ARRAY['stung'], 2, 'any');

-- Card: Nadar
INSERT INTO public.cards (id, deck_id, question) VALUES ('ddd80f71-5beb-42a0-9153-40d74449c001', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Nadar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ddd80f71-5beb-42a0-9153-40d74449c001', 'Infinitivo', ARRAY['swim'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ddd80f71-5beb-42a0-9153-40d74449c001', 'Pasado Simple', ARRAY['swam'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('ddd80f71-5beb-42a0-9153-40d74449c001', 'Pasado Participio', ARRAY['swum'], 2, 'any');

-- Card: Tomar/Llevar
INSERT INTO public.cards (id, deck_id, question) VALUES ('3d73f4d7-d871-4ee4-9829-8af7528d657f', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Tomar/Llevar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3d73f4d7-d871-4ee4-9829-8af7528d657f', 'Infinitivo', ARRAY['take'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3d73f4d7-d871-4ee4-9829-8af7528d657f', 'Pasado Simple', ARRAY['took'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3d73f4d7-d871-4ee4-9829-8af7528d657f', 'Pasado Participio', ARRAY['taken'], 2, 'any');

-- Card: Enseñar
INSERT INTO public.cards (id, deck_id, question) VALUES ('47c249b7-301b-43e3-a3e6-ef210c80e495', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Enseñar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('47c249b7-301b-43e3-a3e6-ef210c80e495', 'Infinitivo', ARRAY['teach'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('47c249b7-301b-43e3-a3e6-ef210c80e495', 'Pasado Simple', ARRAY['taught'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('47c249b7-301b-43e3-a3e6-ef210c80e495', 'Pasado Participio', ARRAY['taught'], 2, 'any');

-- Card: Contar/Decir
INSERT INTO public.cards (id, deck_id, question) VALUES ('afd82fbc-d99e-43eb-a8bb-f9722161d68f', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Contar/Decir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('afd82fbc-d99e-43eb-a8bb-f9722161d68f', 'Infinitivo', ARRAY['tell'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('afd82fbc-d99e-43eb-a8bb-f9722161d68f', 'Pasado Simple', ARRAY['told'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('afd82fbc-d99e-43eb-a8bb-f9722161d68f', 'Pasado Participio', ARRAY['told'], 2, 'any');

-- Card: Pensar
INSERT INTO public.cards (id, deck_id, question) VALUES ('3927f0a2-2829-48f1-9da1-6b5d63ef39b5', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Pensar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3927f0a2-2829-48f1-9da1-6b5d63ef39b5', 'Infinitivo', ARRAY['think'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3927f0a2-2829-48f1-9da1-6b5d63ef39b5', 'Pasado Simple', ARRAY['thought'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3927f0a2-2829-48f1-9da1-6b5d63ef39b5', 'Pasado Participio', ARRAY['thought'], 2, 'any');

-- Card: Lanzar/Arrojar
INSERT INTO public.cards (id, deck_id, question) VALUES ('6b760d73-b0ea-468a-b6da-2be9ba2d5a47', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Lanzar/Arrojar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('6b760d73-b0ea-468a-b6da-2be9ba2d5a47', 'Infinitivo', ARRAY['throw'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('6b760d73-b0ea-468a-b6da-2be9ba2d5a47', 'Pasado Simple', ARRAY['threw'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('6b760d73-b0ea-468a-b6da-2be9ba2d5a47', 'Pasado Participio', ARRAY['thrown'], 2, 'any');

-- Card: Entender
INSERT INTO public.cards (id, deck_id, question) VALUES ('5a6bc4cd-0e35-4308-8bdf-660ff92c95ad', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Entender');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5a6bc4cd-0e35-4308-8bdf-660ff92c95ad', 'Infinitivo', ARRAY['understand'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5a6bc4cd-0e35-4308-8bdf-660ff92c95ad', 'Pasado Simple', ARRAY['understood'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('5a6bc4cd-0e35-4308-8bdf-660ff92c95ad', 'Pasado Participio', ARRAY['understood'], 2, 'any');

-- Card: Despertar
INSERT INTO public.cards (id, deck_id, question) VALUES ('11a8b855-d9b0-4a19-853a-2d49dc6a5322', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Despertar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('11a8b855-d9b0-4a19-853a-2d49dc6a5322', 'Infinitivo', ARRAY['wake'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('11a8b855-d9b0-4a19-853a-2d49dc6a5322', 'Pasado Simple', ARRAY['woke'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('11a8b855-d9b0-4a19-853a-2d49dc6a5322', 'Pasado Participio', ARRAY['woken'], 2, 'any');

-- Card: Vestir/Usar
INSERT INTO public.cards (id, deck_id, question) VALUES ('25cd9f84-06ef-41bb-b071-d2c69fc28473', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Vestir/Usar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('25cd9f84-06ef-41bb-b071-d2c69fc28473', 'Infinitivo', ARRAY['wear'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('25cd9f84-06ef-41bb-b071-d2c69fc28473', 'Pasado Simple', ARRAY['wore'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('25cd9f84-06ef-41bb-b071-d2c69fc28473', 'Pasado Participio', ARRAY['worn'], 2, 'any');

-- Card: Ganar
INSERT INTO public.cards (id, deck_id, question) VALUES ('3b23ead6-133d-4054-a801-d56e5b56bfc4', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Ganar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3b23ead6-133d-4054-a801-d56e5b56bfc4', 'Infinitivo', ARRAY['win'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3b23ead6-133d-4054-a801-d56e5b56bfc4', 'Pasado Simple', ARRAY['won'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('3b23ead6-133d-4054-a801-d56e5b56bfc4', 'Pasado Participio', ARRAY['won'], 2, 'any');

-- Card: Retirar/Sacar
INSERT INTO public.cards (id, deck_id, question) VALUES ('57c611e1-7470-4918-b762-6e3865a54645', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Retirar/Sacar');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57c611e1-7470-4918-b762-6e3865a54645', 'Infinitivo', ARRAY['withdraw'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57c611e1-7470-4918-b762-6e3865a54645', 'Pasado Simple', ARRAY['withdrew'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('57c611e1-7470-4918-b762-6e3865a54645', 'Pasado Participio', ARRAY['withdrawn'], 2, 'any');

-- Card: Escribir
INSERT INTO public.cards (id, deck_id, question) VALUES ('409c1b94-a3d5-49ba-a9d9-d323bf0177d5', 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2', 'Escribir');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('409c1b94-a3d5-49ba-a9d9-d323bf0177d5', 'Infinitivo', ARRAY['write'], 0, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('409c1b94-a3d5-49ba-a9d9-d323bf0177d5', 'Pasado Simple', ARRAY['wrote'], 1, 'any');
INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) VALUES ('409c1b94-a3d5-49ba-a9d9-d323bf0177d5', 'Pasado Participio', ARRAY['written'], 2, 'any');

COMMIT;