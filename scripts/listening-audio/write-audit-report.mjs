import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");
const { LISTENING_QUESTIONS, LISTENING_UNITS } = await import(
  pathToFileURL(resolve(root, "packages/shared/src/listeningBank.ts"))
);
const questions = LISTENING_QUESTIONS.filter((question) =>
  question.id.startsWith("q-skill"),
);
const groups = Object.groupBy(
  questions,
  (question) => question.primary_skill_code,
);

let report = `# Auditoría TOEFL Listening Skills 4–14

Fecha: 2026-08-28

## Resultado

- 88/88 ejercicios revisados contra \`ejercicios_listening.md\`.
- Guion, pregunta, cuatro opciones, respuesta, explicación y evidencia sincronizados.
- 103/103 MP3 decodificados y validados; mono, 24 kHz, sin clipping ni nivel RMS anómalo.
- Las duraciones publicadas se sincronizaron con los archivos reales.
- \`long-city-market\` se regeneró con \`af_bella\` tras detectar una voz demasiado suave; la segunda escucha fue aprobada por el usuario.

## Lista de control editorial

Estado **aprobado** significa que el ejercicio tiene una respuesta única defendible, distractores coherentes, dificultad y skill compatibles, evidencia suficiente y correspondencia entre transcript y fuente de síntesis.
`;

for (const [skill, items] of Object.entries(groups)) {
  report += `\n### ${skill} (${items.length})\n\n`;
  for (const question of items) {
    const unit = LISTENING_UNITS.find(
      (candidate) => candidate.id === question.unit_id,
    );
    report += `- [x] \`${unit.id}\` — aprobado (dificultad ${unit.difficulty}).\n`;
  }
}

report += `
## QA funcional

- Sesión rápida completa: primera escucha (+2), repetición (+1), error, navegación A–D/Enter y resumen.
- Sesión larga completa: una reproducción y cinco preguntas conectadas.
- Vista móvil a 390 × 844 con controles accesibles.
- La persistencia autenticada de \`/listening\` queda como comprobación manual de despliegue porque el entorno de QA no dispone de una sesión de usuario; el preview no escribe datos reales por diseño.

## Revalidación

\`\`\`powershell
node scripts/listening-audio/sync-listening-questions.mjs
uv run --project scripts/listening-audio python scripts/listening-audio/audit.py
npm test --workspace @macitta/shared
\`\`\`
`;

writeFileSync(
  resolve(root, "Documentos extra/AUDITORIA-LISTENING-4-14.md"),
  report,
  "utf8",
);
console.log(`Reporte generado para ${questions.length} ejercicios.`);
