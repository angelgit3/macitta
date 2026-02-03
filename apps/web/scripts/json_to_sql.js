const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, "../../../Documentos extra/verbos_tarjetas.json");
const rawData = fs.readFileSync(jsonPath, "utf-8");
const data = JSON.parse(rawData);

let sql = "TRUNCATE TABLE verbs RESTART IDENTITY;\n";
sql += "INSERT INTO verbs (translation, infinitive, simple_past, past_participle, category, difficulty_level) VALUES\n";

const values = data.cards.map(card => {
    const infinitive = JSON.stringify(card.answers.find(a => a.field === "Infinitivo")?.text);
    const simplePast = JSON.stringify(card.answers.find(a => a.field === "Pasado Simple")?.text);
    const pastParticiple = JSON.stringify(card.answers.find(a => a.field === "Pasado Participio")?.text);

    // Escape single quotes in translation
    const translation = card.front_text.replace(/'/g, "''");

    return `('${translation}', '${infinitive}'::jsonb, '${simplePast}'::jsonb, '${pastParticiple}'::jsonb, 'irregular', 1)`;
});

sql += values.join(",\n") + ";";

console.log(sql);
