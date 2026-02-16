const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const jsonPath = path.resolve(__dirname, '../../../Documentos extra/verbos_tarjetas.json');
const outputPath = path.resolve(__dirname, 'migration.sql');
const deckId = 'd07573b2-7c4a-451b-a487-f8d8f4afc1f2';

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

let sql = `-- Migration SQL for 93 Verbs\n`;
sql += `BEGIN;\n\n`;
sql += `-- Clear existing cards for this mazo\n`;
sql += `DELETE FROM public.cards WHERE deck_id = '${deckId}';\n\n`;

data.cards.forEach((card, cardIndex) => {
    const cardId = crypto.randomUUID();
    const question = card.front_text.replace(/'/g, "''");

    sql += `-- Card: ${question}\n`;
    sql += `INSERT INTO public.cards (id, deck_id, question) VALUES ('${cardId}', '${deckId}', '${question}');\n`;

    card.answers.forEach((answer, slotIndex) => {
        let matchType = 'any';
        let acceptedAnswers = [];

        if (typeof answer.text === 'string') {
            acceptedAnswers = [answer.text];
            matchType = 'any';
        } else if (answer.text.anyOf) {
            acceptedAnswers = answer.text.anyOf;
            matchType = 'any';
        } else if (answer.text.allOf) {
            acceptedAnswers = answer.text.allOf;
            matchType = 'all';
        }

        const label = answer.field.replace(/'/g, "''");
        const answersSql = acceptedAnswers.map(a => `'${a.replace(/'/g, "''")}'`).join(',');

        sql += `INSERT INTO public.card_slots (card_id, label, accepted_answers, order_index, match_type) `;
        sql += `VALUES ('${cardId}', '${label}', ARRAY[${answersSql}], ${slotIndex}, '${matchType}');\n`;
    });
    sql += `\n`;
});

sql += `COMMIT;`;

fs.writeFileSync(outputPath, sql);
console.log(`Successfully generated SQL for ${data.cards.length} cards at ${outputPath}`);
