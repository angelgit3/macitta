# Macitta App Documentation

## 1. Visión General
**Macitta** es una aplicación de *Active Recall* y *Spaced Repetition* (SRS) diseñada para el aprendizaje de verbos en inglés (y potencialmente otros temas). Su objetivo es ayudar a estudiantes a memorizar 100 verbos esenciales mediante un sistema de tarjetas (flashcards) inteligente que se adapta al rendimiento del usuario.

## 2. Tech Stack

## 2. Tech Stack Consolidado

### Arquitectura (Monorepo)
- **Estructura**: Monorepo con Turborepo.
- **Apps**: `apps/web` (Next.js 15/16 con React 19).
- **Packages**: `@macitta/shared` para lógica de negocio, tipos y algoritmo FSRS.

### Frontend & Estilos
- **Estética**: "Obsidian Zen" (Modo oscuro, minimalista, Bento Grids).
- **Framework**: Tailwind CSS v4.

### Persistencia y Offline
- **Base de Datos Remota**: Supabase (PostgreSQL) + Storage para archivos `.mp3` y `.webp`.
- **Base de Datos Local (Sync)**: `Dexie.js` (IndexedDB) para persistencia local de progreso y archivos binarios.
- **Estrategia PWA**: Service Workers para interceptar peticiones y servir la app desde la caché del dispositivo.

### Core Libraries (`packages/shared`)
- **Algoritmo SRS**: `ts-fsrs` (Free Spaced Repetition Scheduler).
- **Relaciones de Datos**: Configuración de `decks`, `cards`, `card_slots`, `user_items` y `study_logs`.

## 3. Lógica Principal del Negocio

### El Algoritmo de Repaso (FSRS)
El núcleo de la aplicación reside en cómo gestiona los intervalos de repaso. Utiliza el algoritmo FSRS para calcular cuándo se debe volver a mostrar una tarjeta en función de la dificultad y la estabilidad de la memoria.

La lógica de calificación se encuentra en `useStudySession`:

1.  **Validación de Respuesta (`validateAnswer`)**:
    - Maneja respuestas múltiples para cada slot (Infinitive, Past, Participle).
    - Soporta comparación exacta y tipos de coincidencia (`any` / `all`).

2.  **Cálculo de Rating Automático**:
    - **Easy (3)**: Correcto + Tiempo < 4s.
    - **Good (2)**: Correcto + Tiempo 4s - 8s.
    - **Hard (1)**: Correcto + Tiempo > 8s.
    - **Again (0)**: Incorrecto o Fallo.
    - *Nota*: La medición de tiempo se optimizó para no penalizar la velocidad de escritura lenta.


### Modelo de Datos (Base de Datos)

#### `verbs`
Contiene el material de estudio estático.
- `id`: UUID.
- `infinitivo`, `pasado`, `participio`: Formas del verbo (pueden ser strings o JSON para múltiples opciones).
- `traduccion`: Significado en español.
- `category`: Clasificación (ej. regular/irregular).

#### `user_progress`
Tabla dinámica que rastrea el estado de aprendizaje de cada usuario para cada verbo.
- `user_id`: Referencia al usuario.
- `verb_id`: Referencia al verbo.
- **Campos FSRS**:
    - `stability`: Estabilidad de la memoria (días hasta olvidar).
    - `difficulty`: Dificultad intrínseca de la tarjeta.
    - `state`: Estado actual (New, Learning, Review, Relearning).
    - `due`: Todo fecha de próximo repaso.
    - `last_practiced`: Última fecha de práctica.

#### `profiles`
Información extendida del usuario.
- `username`: Nombre de usuario único.
- `settings`: Preferencias (ej. meta diaria).

## 4. Flujos de Usuario Principales

### Dashboard (`app/page.tsx`)
- Muestra el progreso diario y total.
- Calcula estadísticas en tiempo real:
    - **Aprendidos**: Verbos que ya no están en estado "New".
    - **Por Repasar**: Verbos con `due` date vencida o anterior a hoy.
    - **Progreso Diario**: Número de verbos practicados hoy vs Meta diaria (default 20).
- Estado de autenticación gestionado con Supabase Auth Sessions.

### Estudio (`app/estudio`)
*(Inferido por estructura)*
- Carga tarjetas pendientes (`due` <= now) o nuevas.
- Presenta la tarjeta (Front).
- Usuario ingresa respuesta.
- Se evalúa localmente usando `@macitta/shared`.
- Se envía el resultado a Supabase para actualizar `user_progress` con los nuevos valores de FSRS calculados.

## 5. Notas Adicionales
- La aplicación está preparada para ser una PWA (Progressive Web App).
- El sistema de tipos está fuertemente integrado entre la base de datos (con tipos generados por Supabase) y el frontend.

## 6. Estrategia de Sincronización (Offline-First)

Para resolver el conflicto entre el backend en la nube y la falta de señal:

1. **Local-First**: Toda acción de estudio se lee de Supabase pero se persiste y utiliza desde `Dexie.js` como fuente primaria.
2. **Sincronización (Syncing)**: La app utiliza un hook `useSync` que gestiona una `syncQueue` en Dexie. Al recuperar conexión, sincroniza cambios pendientes.
3. **Indicador de Estado**: Un botón flotante (`SyncManager`) indica visualmente el estado de la red y permite forzar la sincronización de datos con un clic.
4. **Multimedia Offline**: Reservado para V2 (Almacenamiento de Blobs en IndexedDB).

---
*Nota: Se mantiene Next.js como núcleo para facilitar la escalabilidad hacia una plataforma web completa y permitir su futuro empaquetado como aplicación móvil nativa.*
