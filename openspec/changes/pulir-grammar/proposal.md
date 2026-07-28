# Proposal: pulir-grammar

## Intent

Convertir la práctica de Grammar de Macitta en un sistema de aprendizaje
dosificado y adaptativo. El producto deja de depender de simulacros completos
como experiencia principal y pasa a ofrecer sesiones continuas de cinco
ejercicios, programadas con una adaptación de SREM.

La primera entrega se concentra exclusivamente en **TOEFL ITP Level 1:
Structure and Written Expression**. Reading y Listening quedan fuera de este
cambio hasta validar el modelo con Grammar.

## Problema

La implementación actual agrupa preguntas dentro de exámenes. Ese modelo sirve
para simular una sección, pero no para:

- practicar pocos minutos todos los días;
- programar cada ejercicio según el desempeño individual;
- separar contenido nuevo, débil, consolidado y dominado;
- medir habilidades gramaticales concretas;
- sostener un banco grande y editorialmente controlado;
- aprender de los distractores que el usuario elige.

Además, el banco remoto actual solo contiene siete preguntas de Grammar y al
menos una tiene una clave lingüísticamente incorrecta. No debe migrarse contenido
existente sin revisión.

## Dirección de producto

1. Grammar será un módulo de práctica continua, no un catálogo de exámenes.
2. Una sesión tendrá cinco ejercicios y permitirá continuar con otros cinco.
3. Se admitirán los dos formatos oficiales de TOEFL ITP:
   - `sentence_completion`;
   - `error_identification`.
4. Cada ejercicio tendrá progreso SREM independiente.
5. Dos aciertos espaciados sacarán el ejercicio de aprendizaje activo y lo
   mostrarán como completado; SREM podrá recuperarlo posteriormente para
   mantenimiento.
6. El dominio de una habilidad se estimará con varias preguntas distintas, no
   por memorizar una sola respuesta.
7. La primera base editorial tendrá una meta central de 350 ejercicios
   originales; 100 ejercicios serán un lote piloto, no el tamaño final.

## Alcance

### Incluido

- Taxonomía de Grammar basada en ETS, CEFR y corpus de aprendices.
- Adaptador de SREM para respuestas binarias.
- Cola adaptativa de cinco ejercicios.
- Estados de ejercicio y progreso por habilidad.
- Experiencia de resolución, retroalimentación, resumen y completados.
- Modelo de datos remoto y offline-first.
- Esquema editorial, validación automática y revisión humana.
- Métricas de aprendizaje y de calidad de contenido.
- Plan de migración desde la pantalla TOEFL actual.

### Fuera de alcance

- Implementar Reading o Listening.
- Construir un simulador TOEFL completo.
- Prometer equivalencia con una puntuación oficial.
- Copiar reactivos protegidos de ETS u otras fuentes.
- Publicar ejercicios generados sin revisión humana.
- Modificar datos de producción durante la fase de investigación.

## Decisiones principales

| Tema | Decisión |
|---|---|
| Objetivo | TOEFL ITP Level 1, Structure and Written Expression |
| Tamaño de sesión | 5 ejercicios |
| Mezcla de formatos | Aproximadamente 2 completion + 3 error identification |
| Programación | SREM compartido, con adaptador específico para Grammar |
| Tiempo | Se registra, pero no cambia la calificación SREM en V1 |
| Acierto | `Good` |
| Error | `Again` |
| Completado | Paso SREM 2 o superior, tras aciertos en sesiones separadas |
| Dominado | Estado SREM `mastered`, reservado para retención prolongada |
| Banco piloto | 100 ejercicios revisados |
| Banco núcleo | 350 ejercicios, 10 por cada una de 35 microhabilidades |
| Fuente de verdad | Contenido versionado en el repositorio y publicado a Supabase |
| Historial | Intentos append-only e idempotentes |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Memorizar respuestas en vez de reglas | Espaciado, variantes y progreso por habilidad |
| Repetir siempre los ejercicios más débiles | Cola por vencimiento con diversidad y cupo de contenido nuevo |
| Penalizar injustamente respuestas lentas | Tiempo solo analítico hasta calibrar por tipo y dificultad |
| Preguntas ambiguas o mal marcadas | Doble revisión, validador y retiro versionado |
| Perder progreso al sincronizar offline | Eventos con UUID e inserción idempotente; proyección local inmediata |
| Inflar una supuesta puntuación TOEFL | Reportar aprendizaje interno, no score oficial |
| Copiar propiedad intelectual | Contenido original y referencias usadas solo para especificación |

## Criterios de éxito de la feature

- Existe una especificación aprobada del dominio y los dos formatos.
- SREM puede programar ejercicios de Grammar sin alterar la conducta de tarjetas.
- Una sesión adaptativa siempre intenta entregar hasta cinco ejercicios elegibles.
- Dos aciertos espaciados llevan un ejercicio a Completados sin impedir futuros
  repasos de mantenimiento.
- El usuario puede ver qué habilidades están débiles, en desarrollo y consolidadas.
- El banco piloto pasa validaciones estructurales, lingüísticas, de accesibilidad
  y de balance.
- Los intentos y el progreso funcionan online y offline sin duplicar eventos.
- Las políticas RLS aíslan completamente el progreso de cada usuario.
- No se presenta ninguna métrica como puntuación oficial de TOEFL.
