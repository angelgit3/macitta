# Tasks: pulir-grammar

## Phase 0: investigación y contrato

- [x] 0.1 Confirmar que el objetivo es TOEFL ITP Level 1 Structure and Written Expression.
- [x] 0.2 Verificar proporción, tiempo y definición de los dos formatos.
- [x] 0.3 Auditar SREM, cola por vencimiento, Rush Mode y persistencia actual.
- [x] 0.4 Auditar tablas e índices relevantes en Supabase remoto.
- [x] 0.5 Auditar las siete preguntas actuales de Grammar.
- [x] 0.6 Proponer taxonomía, pipeline editorial, UX y modelo de datos.
- [x] 0.7 Aprobar nombre visible y taxonomía final con el responsable de producto.

## Phase 1: núcleo técnico

- [x] 1.1 Extraer la transición SREM a una función que acepte grado explícito.
- [x] 1.2 Mantener un adaptador de tarjetas retrocompatible.
- [x] 1.3 Implementar adaptador Grammar `correct → Good`, `incorrect → Again`.
- [x] 1.4 Añadir tipos discriminados y validadores de los dos formatos.
- [x] 1.5 Implementar constructor puro de sesiones de cinco.
- [x] 1.6 Cubrir invariantes y compatibilidad con pruebas unitarias.

## Phase 2: datos

- [x] 2.1 Crear una migración con Supabase CLI para catálogos, contenido, progreso, sesiones e intentos.
- [x] 2.2 Añadir constraints, foreign keys e índices de patrones reales.
- [x] 2.3 Añadir grants y RLS con pruebas positivas y negativas.
- [x] 2.4 Ejecutar advisors de seguridad y rendimiento.
- [x] 2.5 Añadir tablas Dexie y operaciones de sincronización.
- [x] 2.6 Verificar idempotencia y recuperación offline.

## Phase 3: experiencia Grammar

- [x] 3.1 Crear inicio del módulo con CTA “Repasar 5”.
- [x] 3.2 Crear renderer accesible de sentence completion.
- [x] 3.3 Crear renderer accesible de error identification.
- [x] 3.4 Añadir feedback inmediato, corrección y explicación.
- [x] 3.5 Crear resumen y CTA “Otros 5”.
- [x] 3.6 Crear zona de Completados y mantenimiento.
- [x] 3.7 Crear vista de progreso por dominio y habilidad.

## Phase 4: contenido

- [x] 4.1 Congelar el catálogo final de microhabilidades.
- [x] 4.2 Crear formato fuente versionado y validador CLI.
- [x] 4.3 Producir lote calibrador de 30–50 ejercicios originales.
- [x] 4.4 Completar doble revisión lingüística y de fairness.
- [x] 4.5 Publicar piloto de 100.
- [x] 4.6 Llegar a 10 ejercicios por microhabilidad.
- [x] 4.7 Auditar balance A–D, formato, CEFR, dificultad y duplicados.

## Phase 5: medición y rollout

- [x] 5.1 Instrumentar métricas de aprendizaje, producto y calidad de contenido.
- [x] 5.2 Activar la ruta principal de Grammar en la navegación.
- [x] 5.3 Ejecutar pruebas online, de cola offline y visuales responsivas.
- [x] 5.4 Validar con una cuenta real sin presentar equivalencias de score TOEFL.
- [x] 5.5 Revisar reactivos con distractores no funcionales o señales de ambigüedad.
- [x] 5.6 Mantener la pantalla de simulacros como acceso secundario.

## Gates

- [x] Gate A: ningún cambio de tarjetas en las pruebas SREM existentes.
- [x] Gate B: ningún ejercicio sin exactamente una respuesta correcta.
- [x] Gate C: ningún contenido copiado de bancos protegidos.
- [x] Gate D: RLS impide leer o modificar progreso de otro usuario.
- [x] Gate E: dos aciertos en la misma sesión no producen Completado.
- [x] Gate F: los intentos offline no se duplican.
- [x] Gate G: un reactivo retirado no vuelve a una sesión.
