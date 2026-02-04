const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '../../../Documentos extra/verbos_tarjetas.json');
const outputPath = path.resolve(__dirname, '../utils/supabase/seed_sem.sql');

try {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    let sql = `
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

`;

    data.cards.slice(0, 20).forEach((card) => {
        // Escape single quotes in question
        const question = card.front_text.replace(/'/g, "''");

        sql += `
  -- Card: ${question}
  INSERT INTO public.cards (deck_id, question)
  VALUES (new_deck_id, '${question}')
  RETURNING id INTO new_card_id;
`;

        card.answers.forEach((ans, index) => {
            const label = ans.field;
            let accepted = [];
            let matchType = 'any';

            if (typeof ans.text === 'string') {
                accepted.push(ans.text);
            } else if (typeof ans.text === 'object') {
                if (Array.isArray(ans.text)) {
                    // Simple array in JSON behaves like anyOf
                    accepted = ans.text;
                    matchType = 'any';
                } else if (ans.text.anyOf) {
                    accepted = ans.text.anyOf;
                    matchType = 'any';
                } else if (ans.text.allOf) {
                    accepted = ans.text.allOf;
                    matchType = 'all';
                }
            }

            // Format array for SQL: ARRAY['ans1', 'ans2']
            const arrayStr = "ARRAY[" + accepted.map(a => `'${a.replace(/'/g, "''")}'`).join(", ") + "]";

            sql += `  INSERT INTO public.card_slots (card_id, label, accepted_answers, match_type, order_index) VALUES (new_card_id, '${label}', ${arrayStr}, '${matchType}', ${index + 1});\n`;
        });
    });

    sql += `
END $$;
`;

    fs.writeFileSync(outputPath, sql);
    console.log(`Generated SQL seed file at: ${outputPath}`);

} catch (err) {
    console.error("Error generating SQL:", err);
}
