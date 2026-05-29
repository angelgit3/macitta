# Plan Maestro de Reestructuración: Macitta TOEFL Prep Simulator

Este documento técnico sirve como especificación de diseño detallada, justificación arquitectónica y guía paso a paso para que una inteligencia artificial de código implemente la reestructuración completa de Macitta.

---

## 0. Ajustes para convertir este plan en una V1 implementable

Este documento ya no debe leerse como una reescritura total de una sola vez. La estrategia recomendada es convertir el pivot TOEFL en una serie de entregas pequeñas, verificables y reversibles, manteniendo estable el core S-REM que ya funciona.

### 0.1 Estado actual confirmado

*   **Limpieza de aulas completada**: La lógica de profesor/alumno, rutas de docente, rutas de clases, asignación de mazos a grupos y restricción de registro por dominio institucional ya fue eliminada del código de la app.
*   **Migración base creada**: Ya existe una migración que elimina tablas, funciones, policies y columna `profiles.role` relacionadas con aulas/roles.
*   **Nuevo punto de partida**: La V1 TOEFL debe partir desde una Macitta personal, sin roles institucionales y con RLS centrado en datos propios del usuario.

### 0.2 Fases recomendadas

#### Fase 1: Base TOEFL mínima
Crear el modelo de datos TOEFL en Supabase y Dexie, actualizar tipos compartidos y sembrar un primer set pequeño de exámenes de prueba. Esta fase debe permitir listar exámenes y abrir una práctica, aunque la UI todavía sea simple.

#### Fase 2: Player Reading y Grammar
Implementar el flujo de práctica para preguntas de opción múltiple sin audio. Primero Reading y Grammar porque reducen el riesgo técnico y validan el modelo de intentos, respuestas y score.

#### Fase 3: Score Screen y Prompt Generator
Construir la pantalla de resultados, revisión de respuestas, selección de preguntas y generación local del prompt para copiar al portapapeles.

#### Fase 4: Listening y audio
Agregar audio con Supabase Storage, modos estricto/flexible, bloqueo de controles en modo estricto y transcript visible solo en revisión.

#### Fase 5: Mazo global S-REM e inbox
Conectar lecturas/errores/vocabulario TOEFL con S-REM mediante `srem_inbox`. Esta fase debe ser posterior para no mezclar prematuramente el motor de exámenes con el motor de memoria.

### 0.3 Decisiones técnicas cerradas para V1

*   **TOEFL y S-REM conviven, no se fusionan al inicio**: TOEFL registra intentos y puntajes; S-REM sigue manejando memoria de tarjetas. La conexión entre ambos vive en `srem_inbox`.
*   **Opciones con identificador estable**: Las preguntas no deben depender de comparar texto exacto para saber la respuesta correcta. `options` debe guardar objetos con `id` y `text`, y la respuesta correcta debe apuntar a `correct_option_id`.
*   **Orden explícito de preguntas**: `questions` debe incluir `order_index` para renderizado, navegación y evaluación determinista.
*   **Agrupación de preguntas**: Para lecturas o audios compartidos, V1 puede usar `exam_id` como agrupador suficiente. Si después se necesitan múltiples pasajes por examen, se agregará una tabla `question_groups`.
*   **Audio por path, no solo URL**: Guardar `audio_path` de Supabase Storage y construir URL pública o firmada desde la app. Esto da más control que persistir una URL final.
*   **No usar lenguaje de afiliación oficial**: Evitar frases como "preparador oficial TOEFL" en UI o prompts. Usar "tutor experto para TOEFL iBT" para no sugerir afiliación con ETS.

### 0.4 Criterios de aceptación de la V1

*   Un usuario autenticado puede ver una lista de prácticas TOEFL.
*   Puede completar al menos una práctica Reading o Grammar en modo flexible.
*   La app guarda `user_exam_attempts` y `user_question_answers` con RLS por `auth.uid()`.
*   La pantalla de resultados muestra raw score, scaled score, precisión, tiempo y revisión por pregunta.
*   El usuario puede seleccionar preguntas y copiar un prompt de tutoría generado en cliente.
*   Lint, tests y build pasan antes de considerar cerrada cada fase.

---

## 1. Visión del Pivot y Justificación de Diseño

### 1.1 El Cambio de Enfoque: De Aula Institucional a Simulador Personalizado
Macitta se transforma de una plataforma multi-usuario basada en aulas (profesor-estudiante) a una **plataforma individual de alto rendimiento enfocada en la preparación para el examen TOEFL (Listening, Reading, Structure/Grammar)**.

*   **Simplificación Radical**: Se eliminan las tablas y la lógica compleja de membresía de aulas, asignaciones de tareas y roles. Esto elimina la fricción técnica y centraliza la base de datos y las políticas de seguridad (RLS) en el usuario final (`auth.uid() = user_id`).
*   **Aporte Multimodal**: Se integran lecturas extensas (Reading) y archivos de audio (Listening) con reproducción simulada offline-first.
*   **Soberanía del Aprendizaje con IA**: Se descartan las APIs de IA costosas y lentas para el feedback. En su lugar, se implementa el patrón **Client-Side Prompt Generation**, el cual prepara un reporte exhaustivo de los aciertos y errores del usuario para que este lo copie y lo use de forma gratuita en su modelo de lenguaje preferido (ChatGPT, Claude, Gemini, etc.).

---

## 2. Nueva Arquitectura de Base de Datos (Supabase & Dexie.js)

Para soportar exámenes por secciones, ponderación de puntos y el historial de intentos, la base de datos relacional debe migrarse a la siguiente estructura. Esta estructura debe replicarse tanto en **Supabase (PostgreSQL)** como en **Dexie.js (IndexedDB)** para mantener la capacidad Offline-First.

```
┌─────────────────┐       ┌─────────────────┐       ┌───────────────────────────┐
│     exams       │       │    questions    │       │     user_exam_attempts    │
├─────────────────┤       ├─────────────────┤       ├───────────────────────────┐
│ - id (UUID)     │◄─────┼│ - id (UUID)     │       │ - id (UUID)               │
│ - title         │       │ - exam_id (FK)  │       │ - user_id (UUID)          │
│ - section       │       │ - question_text │       │ - exam_id (FK)            │
│ - type          │       │ - options (JSON)│       │ - raw_score (Integer)     │
│ - audio_path    │       │ - correct_opt_id│       │ - scaled_score (Integer)  │
│ - transcript    │       │ - points_weight │       │ - time_taken (Integer)    │
│ - scale_mapping │       │ - explanation   │       │ - mode (Text)             │
└─────────────────┘       └─────────────────┘       │ - completed_at (Timestamp)│
                                  ▲                 └─────────────┬─────────────┘
                                  │                               │
                                  │         ┌─────────────────────▼─────┐
                                  │         │ user_question_answers     │
                                  │         ├───────────────────────────┤
                                  └─────────│ - attempt_id (FK)         │
                                            │ - question_id (FK)        │
                                            │ - user_choice             │
                                            │ - is_correct (Boolean)    │
                                            └───────────────────────────┘
```

### 2.1 Tabla: `exams`
Almacena la cabecera de las prácticas o simulacros.
*   `id` (UUID, PK): Identificador único autogenerado en el cliente o servidor.
*   `title` (Text): Nombre descriptivo (ej: "Practice Reading 1 - Academic Texts").
*   `section` (Text): `reading` | `listening` | `grammar`
*   `type` (Text): Subtipo detallado de la sección.
    *   Para `reading`: `short_passage` | `long_passage`
    *   Para `listening`: `short_conversation` | `long_lecture`
    *   Para `grammar`: `error_identification` | `sentence_completion`
*   `passage_text` (Text, Nullable): El texto de la lectura si la sección es `reading`.
*   `audio_path` (Text, Nullable): Ruta del archivo MP3 dentro de Supabase Storage si la sección es `listening`. La app debe construir la URL pública o firmada al momento de reproducir.
*   `transcript` (Text, Nullable): Transcripción completa del audio (vital para que el generador de prompts alimente a la IA).
*   `scale_mapping` (JSONB): Matriz de conversión exacta que mapea el puntaje bruto obtenido a la escala TOEFL de 0 a 30 puntos (ej: `{"20": 30, "19": 29, "18": 28, ... "0": 0}`).

### 2.2 Tabla: `questions`
Almacena los reactivos de cada examen.
*   `id` (UUID, PK): Identificador único.
*   `exam_id` (UUID, FK -> `exams.id` con borrado en cascada).
*   `question_text` (Text): El enunciado del reactivo.
*   `options` (JSONB): Lista de opciones posibles con identificador estable (ej: `[{"id": "A", "text": "Option A"}, {"id": "B", "text": "Option B"}]`).
*   `correct_option_id` (Text): Identificador de la opción correcta (`"A"`, `"B"`, `"C"`, `"D"`). Evita depender de comparar texto exacto.
*   `order_index` (Integer): Posición de la pregunta dentro del examen para navegación y renderizado determinista.
*   `points_weight` (Integer): Ponderación del reactivo. Por defecto es `1`. Ciertos reactivos complejos del TOEFL pueden valer `2` o `3` puntos.
*   `explanation` (Text): Retroalimentación estática que explica detalladamente por qué esa respuesta es la correcta y qué distractores tienen las otras opciones.

### 2.3 Tabla: `user_exam_attempts`
Registra cada vez que un usuario completa un examen.
*   `id` (UUID, PK): Identificador del intento.
*   `user_id` (UUID, FK -> `auth.users.id`).
*   `exam_id` (UUID, FK -> `exams.id`).
*   `raw_score` (Integer): Suma total de los puntos obtenidos basados en el peso de cada pregunta.
*   `scaled_score` (Integer): Puntaje final escalado en el rango 0-30, calculado mediante el `scale_mapping` del examen.
*   `time_taken` (Integer): Tiempo total que duró el intento, medido en segundos.
*   `mode` (Text): `'strict'` (Modo Simulacro real) | `'flexible'` (Modo Práctica libre).
*   `completed_at` (Timestamp): Fecha y hora de finalización del intento.

### 2.4 Tabla: `user_question_answers`
Registra las respuestas individuales seleccionadas en cada intento, fundamental para renderizar la pantalla de resultados y armar el prompt dinámico de la IA.
*   `attempt_id` (UUID, PK/FK -> `user_exam_attempts.id` con borrado en cascada).
*   `question_id` (UUID, PK/FK -> `questions.id`).
*   `user_choice` (Text): Identificador de la opción elegida por el usuario.
*   `is_correct` (Boolean): Bandera de verificación inmediata.

### 2.5 Tabla de Soporte S-REM: `srem_inbox`
Evita los costos de traducción automática de palabras al vuelo mediante el patrón de bandeja de entrada para estudio asíncrono.
*   `id` (UUID, PK).
*   `user_id` (UUID, FK).
*   `word` (Text): Palabra seleccionada (ej: "proliferation").
*   `context` (Text): Oración original donde apareció la palabra en la lectura.
*   `created_at` (Timestamp).

---

## 3. Lógica del Algoritmo y Lógica de Negocio

### 3.1 El "Mazo Global" (La Feature Estrella de Macitta)
La aplicación debe priorizar un único botón principal de estudio en el dashboard llamado **"Estudiar con un botón"**.
*   **Justificación de Diseño**: El estudio aislado por mazos debilita la retención a largo plazo debido a que el cerebro se acostumbra al mismo tema (sesgo de contexto). La mezcla de temas (interleaving) mediante un botón global obliga al cerebro a hacer un mayor esfuerzo cognitivo de recuperación, reforzando la memoria.
*   **Lógica de Consulta**: El botón global consulta en la base de datos de IndexedDB (Dexie) todas las tarjetas de cualquier mazo cuyo estado de S-REM requiera atención inmediata:
    ```javascript
    const today = new Date().toISOString();
    const cardsToStudy = await db.user_items
      .where('due_date')
      .belowOrEqual(today)
      .toArray();
    ```
*   **Modo Enfoque**: El usuario aún puede entrar a un mazo específico (ej: "Verbos Irregulares") si tiene un examen de ese tema al día siguiente, pero se marcará como un estudio enfocado de "cramming", aislando temporalmente el filtro de consulta con `deck_id`.

### 3.2 Lógica de los Modos de Práctica TOEFL

Al iniciar un examen, se le presenta al usuario la opción de elegir entre dos modos:

#### A. Modo Estricto (Simulador Real)
*   **Lógica del Audio (Listening)**: Se ejecuta de forma automática inmediatamente al cargar la pantalla. La barra de progreso y los controles de reproducción (pausa, velocidad, retroceso) están deshabilitados. El audio se reproduce **una sola vez**.
*   **Lógica del Tiempo**: El temporizador corre hacia atrás (cuenta regresiva, ej: de 50 minutos a 00:00). Al alcanzar el límite, se ejecuta de forma automática la función de enviar respuestas, finalizando el intento sin importar si quedaron reactivos en blanco.
*   **Navegación**: Sigue un flujo rígido. No se permite regresar a revisar lecturas previas o audios anteriores si ya se avanzó.
*   **Transcripción**: Oculta. Solo visible al finalizar el examen en la pantalla de revisión.

#### B. Modo Flexible (Gimnasio de Práctica)
*   **Lógica del Audio**: Controles habilitados. El usuario puede pausar, cambiar la velocidad (ej: `0.8x` para principiantes o `1.2x` para entrenarse con velocidad aumentada) y retroceder 5 segundos.
*   **Lógica del Tiempo**: El cronómetro corre hacia arriba (cuenta ascendente en segundos). Le permite al usuario ver exactamente cuánto tiempo se está demorando sin la presión de un bloqueo automático.
*   **Navegación**: Libre. Se puede ir adelante y atrás por todo el examen.

---

## 4. Diseño de la Interfaz y Flujo de Pantallas

### 4.1 Pantalla de Práctica (TOEFL Player)
*   **Lecturas**: Debe contar con un diseño de pantalla dividida (split screen) en pantallas grandes. El panel izquierdo muestra el pasaje de lectura de forma fija para evitar perder el contexto. El panel derecho muestra las preguntas de opción múltiple una a una.
*   **Audios**: Muestra una interfaz minimalista con una onda de audio o animación sutil que indica que el audio se está reproduciendo. La transcripción se mantiene oculta para forzar el entrenamiento del oído.

### 4.2 Pantalla de Resultados (The Score Screen)
Muestra la gloria de terminar la práctica y se compone de:
1.  **Tarjeta Hero**: Muestra la puntuación calculada en el rango 0-30, la precisión porcentual y el tiempo utilizado.
2.  **Mensaje Motivador de Rango**: Selecciona aleatoriamente una frase motivadora según el puntaje final:
    *   `[24 - 30]`: Nivel competitivo / élite.
    *   `[16 - 23]`: Nivel sólido con áreas de oportunidad.
    *   `[0 - 15]`: Mensajes enfocados a la resiliencia y el hábito constante.
3.  **Selector Interactivo de Preguntas para el Tutor de IA**:
    *   Se lista cada pregunta con un borde verde (Correcta) o rojo (Incorrecta).
    *   Se muestra la opción elegida por el usuario y la correcta.
    *   Se muestra la **Retroalimentación Estática**: Explicación de por qué es la respuesta correcta e incorrecta de forma pedagógica.
    *   Cada pregunta tiene un selector (checkbox). Por defecto, las incorrectas se marcan como seleccionadas para el reporte y las correctas como deseleccionadas.
    *   El usuario puede marcar manualmente cualquier pregunta correcta en la que haya "atinado" por suerte, para incluirla en el análisis.

---

### 4.3 El Motor de Prompts de IA (Client-Side Prompt Generator)

Una vez que el usuario selecciona los reactivos en la pantalla de revisión, presiona el botón **"Preparar tutoría de IA"**.

1.  **Pantalla de Carga Sincrónica (Falsa Latencia)**: El sistema muestra una animación de análisis durante 1.5 segundos. Esto es una micro-interacción crítica para aumentar el valor percibido del reporte personalizado.
2.  **La Estructura del Prompt Generado**:
    La app procesa los reactivos seleccionados y redacta un string en el portapapeles con este formato exacto:

```markdown
Actúa como un tutor experto de inglés y preparador para la prueba TOEFL iBT. Acabo de realizar una práctica enfocada en la sección de [SECCIÓN] (Subtipo: [TIPO]) de mi examen.

A continuación te presento los materiales de estudio que utilicé en esta práctica para que tengas todo el contexto necesario:

---
MATERIAL DE REFERENCIA (Lectura o transcripción del audio escuchado):
[TEXTO DE LA LECTURA O TRANSCRIPCIÓN COMPLETA DEL AUDIO]
---

He seleccionado algunas preguntas específicas en las que fallé o en las que tengo dudas sobre su lógica de resolución. Necesito que analices detalladamente cada reactivo y me des una explicación clara que aborde:
1. Por qué la respuesta correcta es la única opción válida técnicamente (regla gramatical, sinonimia, inferencia basada en el texto, etc.).
2. Cuál es la trampa o debilidad conceptual en la opción incorrecta que yo seleccioné (por qué es un distractor común en el TOEFL).
3. Si la sección es de LISTENING, explícame si mi error pudo deberse a un problema de oído humano común (por ejemplo, homófonos, palabras con pronunciación muy similar como 'accept' vs 'except', o reducciones del habla conectada en inglés norteamericano).

Aquí están los detalles de las preguntas a analizar:

[REPETIR PARA CADA PREGUNTA SELECCIONADA POR EL USUARIO]
=========================================
PREGUNTA: [Texto de la pregunta]
Opciones presentadas en el examen:
* A) [Texto opción A]
* B) [Texto opción B]
* C) [Texto opción C]
* D) [Texto opción D]

Mi respuesta elegida: [Texto de la respuesta incorrecta del usuario]
Respuesta correcta: [Texto de la respuesta correcta del examen]
=========================================

Dame una explicación amigable, directa, con formato limpio y explicaciones muy enfocadas para que logre hacer "click" con mi error y corregir mis vacíos de conocimiento.
```

3.  **Botón de Copiado**: Al finalizar la simulación de carga, el texto anterior se copia al portapapeles y se le muestra un mensaje claro al alumno invitándolo a pegarlo de forma gratuita en su chat de IA preferido.

---

## 5. Guía de Implementación Paso a Paso (Para la IA de Código)

La IA encargada de programar esta actualización debe seguir este orden estricto de tareas para garantizar la estabilidad de la aplicación:

### Paso 1: Limpieza del Módulo de Aulas (completado)
1.  **Eliminación de tablas en Supabase**: Ya existe una migración para eliminar `classrooms`, `classroom_students`, `classroom_decks`, funciones auxiliares y `profiles.role`.
2.  **Limpieza de RLS**: Las policies de `profiles`, `user_items`, `study_logs`, `study_sessions` y `feedback` quedan simplificadas hacia propiedad del usuario.
3.  **Eliminación de rutas en Next.js**: Ya se removieron rutas y componentes bajo `apps/web/app/(app)/docente`, `apps/web/app/(app)/mis-clases`, `JoinClassForm`, `AssignToClassroomDialog` y helpers relacionados.

### Paso 2: Base TOEFL mínima
1.  **Migración SQL de Supabase**: Crear las tablas `exams`, `questions`, `user_exam_attempts`, `user_question_answers` y `srem_inbox`.
2.  **RLS por usuario**: `exams` y `questions` pueden ser leídas por usuarios autenticados; `user_exam_attempts`, `user_question_answers` y `srem_inbox` deben estar restringidas por `auth.uid() = user_id`.
3.  **Índices mínimos**: Agregar índices en `questions.exam_id`, `user_exam_attempts.user_id`, `user_exam_attempts.exam_id`, `user_question_answers.attempt_id` y `srem_inbox.user_id`.
4.  **Tipos TypeScript**: Actualizar `packages/shared/src/types.ts` y `apps/web/types/models.ts`.
5.  **Dexie**: Agregar stores locales equivalentes sin romper los stores actuales de S-REM.
6.  **Seed pequeño**: Incluir al menos una práctica Reading y una Grammar para validar el flujo completo.

### Paso 3: Player Reading y Grammar
1.  **Lista de prácticas**: Crear una pantalla donde el usuario pueda elegir una práctica TOEFL por sección.
2.  **Modo flexible primero**: Implementar navegación libre, cronómetro ascendente y guardado local/remoto del intento.
3.  **Calificación**: Calcular `raw_score` con `points_weight` y `scaled_score` con `scale_mapping`.
4.  **Persistencia**: Guardar intento y respuestas individuales en Supabase/Dexie.

### Paso 4: Score Screen y Prompt Generator
1.  **Pantalla Final**: Implementar score 0-30, precisión, tiempo, frase motivadora y revisión por pregunta.
2.  **Selector de preguntas**: Marcar incorrectas por defecto y permitir seleccionar correctas manualmente.
3.  **Prompt local**: Generar el texto en cliente, simular 1.5 segundos de análisis y copiar al portapapeles.
4.  **Sin APIs de IA**: No se guarda ni envía el contenido del prompt a servicios externos desde la app.

### Paso 5: Listening y audio
1.  **Storage**: Usar `audio_path` de Supabase Storage y resolver URL al reproducir.
2.  **Modo flexible**: Permitir pausa, velocidad y retroceso.
3.  **Modo estricto**: Reproducir una sola vez, ocultar transcript, bloquear controles y finalizar por temporizador.
4.  **Revisión**: Mostrar transcript solo después de completar el intento.

### Paso 6: Mazo Global S-REM e Inbox
1.  **Botón global**: Crear el flujo "Estudiar con un botón" para tarjetas vencidas de todos los mazos.
2.  **Modo enfoque**: Mantener entrada a mazos específicos para sesiones de cramming.
3.  **S-REM Inbox**: Guardar palabras desde lecturas y permitir convertirlas después en tarjetas.
4.  **Integración gradual**: No bloquear la V1 TOEFL si esta fase se posterga.

---

*Este plan asegura una transición limpia, preservando el core matemático de tu algoritmo S-REM mientras transforma a Macitta en un simulador de preparación TOEFL líder en accesibilidad y eficiencia.*
