# Fuentes editoriales

Esta carpeta conserva material fuente revisable por personas. La aplicación no
lo consume durante la ejecución.

- `ejercicios_listening.md`: fuente canónica de los 88 ejercicios Listening
  Skills 4–14. Incluye guion, opciones, solución y explicación.
- `listening.md`: guía pedagógica y criterios de cada skill de Listening.
- `banco_vocabulario_claves.md`: vocabulario y patrones de apoyo para Listening.
- `completar_con_el_correcto.md` y `elegir_el_incorrecto.md`: fuentes de Grammar.
- `lecturas.md`: fuente editorial de Reading.

Para Listening, los guiones de síntesis se versionan en
`scripts/listening-audio/listening-bank.json`. El catálogo TypeScript se
sincroniza con `node scripts/listening-audio/sync-listening-questions.mjs` y se
valida con `npm test --workspace @macitta/shared`.
