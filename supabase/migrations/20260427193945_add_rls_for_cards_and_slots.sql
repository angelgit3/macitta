-- Políticas para la tabla CARDS

-- Eliminar si existen previamente
DROP POLICY IF EXISTS "cards_insert_author" ON public.cards;
DROP POLICY IF EXISTS "cards_update_author" ON public.cards;
DROP POLICY IF EXISTS "cards_delete_author" ON public.cards;

-- Insertar: Puedes insertar si el deck es tuyo
CREATE POLICY "cards_insert_author" 
ON public.cards FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.decks 
        WHERE id = deck_id AND author_id = auth.uid()
    )
);

-- Actualizar: Puedes editar si el deck es tuyo
CREATE POLICY "cards_update_author" 
ON public.cards FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.decks 
        WHERE id = deck_id AND author_id = auth.uid()
    )
);

-- Borrar: Puedes borrar si el deck es tuyo
CREATE POLICY "cards_delete_author" 
ON public.cards FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.decks 
        WHERE id = deck_id AND author_id = auth.uid()
    )
);

-- Políticas para la tabla CARD_SLOTS

-- Eliminar si existen previamente
DROP POLICY IF EXISTS "card_slots_insert_author" ON public.card_slots;
DROP POLICY IF EXISTS "card_slots_update_author" ON public.card_slots;
DROP POLICY IF EXISTS "card_slots_delete_author" ON public.card_slots;

-- Insertar: Puedes insertar respuestas si la carta es de un deck tuyo
CREATE POLICY "card_slots_insert_author" 
ON public.card_slots FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cards c
        JOIN public.decks d ON c.deck_id = d.id
        WHERE c.id = card_id AND d.author_id = auth.uid()
    )
);

-- Actualizar: Puedes editar respuestas si la carta es de un deck tuyo
CREATE POLICY "card_slots_update_author" 
ON public.card_slots FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cards c
        JOIN public.decks d ON c.deck_id = d.id
        WHERE c.id = card_id AND d.author_id = auth.uid()
    )
);

-- Borrar: Puedes borrar respuestas si la carta es de un deck tuyo
CREATE POLICY "card_slots_delete_author" 
ON public.card_slots FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cards c
        JOIN public.decks d ON c.deck_id = d.id
        WHERE c.id = card_id AND d.author_id = auth.uid()
    )
);;
