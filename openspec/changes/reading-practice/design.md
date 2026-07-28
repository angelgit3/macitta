# Diseño técnico

## Modelo de aprendizaje

Cada pregunta mantiene un progreso de 0, 1 o 2 puntos. Un acierto al primer
intento obtiene 2; después de un error, el reactivo necesita dos recuperaciones
correctas. Al llegar a 2 deja la cola exacta.

En paralelo, la habilidad principal actualiza el SREM compartido. Cuando una
habilidad queda pendiente, la cola busca primero preguntas nuevas de esa
habilidad y evita los pasajes vistos recientemente. Así se separa dominio de la
habilidad de memoria del reactivo.

## Coherencia de lectura

La unidad de selección es el bloque, no una pregunta aislada. Una práctica
diaria excluye textos largos; una lectura larga ofrece el bloque 1 y conserva el
bloque 2. Si el usuario abandona un bloque, el botón de lectura larga retoma
primero las preguntas pendientes del mismo texto.

## Datos y seguridad

Los catálogos (`reading_domains`, `reading_skills`, `reading_passages`,
`reading_questions`) son de solo lectura para usuarios autenticados. Progreso,
exposición, sesiones e intentos usan RLS por propietario. Las escrituras
críticas pasan por RPC con revisión optimista y se reconstruyen desde intentos
inmutables cuando dos dispositivos entran en conflicto.

IndexedDB replica catálogo y datos privados para uso offline. Al cerrar sesión
se eliminan progresos, sesiones, intentos y operaciones pendientes del usuario.

## Contenido

La fuente versionada vive en `packages/shared/src/readingBankSeeds`. Un
generador determinista produce migraciones SQL y el informe editorial. Los
validadores comprueban bandas de longitud, claves, cuatro opciones únicas,
evidencia literal, explicaciones de distractores, balance de respuestas,
cobertura de habilidades y estructura 5/10.

