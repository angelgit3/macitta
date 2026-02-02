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
- **Validación**: `zod`.
- **Comparación de Textos**: `fast-levenshtein` (para detectar typos y calcular similitud).

## 3. Lógica Principal del Negocio

### El Algoritmo de Repaso (FSRS)
El núcleo de la aplicación reside en cómo gestiona los intervalos de repaso. Utiliza el algoritmo FSRS para calcular cuándo se debe volver a mostrar una tarjeta en función de la dificultad y la estabilidad de la memoria.

La lógica de calificación se encuentra en `packages/shared/index.ts`:

1.  **Validación de Respuesta (`validateAnswer`)**:
    - Maneja respuestas complejas: cadenas simples, arrays de respuestas válidas, opciones múltiples (`anyOf`), o requerimientos compuestos (`allOf`).
    - Normaliza entradas (minusculas, trim) para comparación.

2.  **Cálculo de Rating (`calculateRating`)**: determina la calidad de la respuesta (Again, Hard, Good, Easy) basándose en dos factores:
    - **Distancia de Levenshtein**: Mide qué tan cerca estuvo la respuesta del usuario de la correcta (permite pequeños typos).
    - **Tiempo de Respuesta**:
        - **< 4s**: Easy (si es correcto).
        - **4s - 8s**: Good (si es correcto).
        - **> 8s**: Hard (aunque sea correcto).
        - **Error o Distancia > 1**: Again (Fallo).

### Algoritmo SRS (FSRS)
- **Implementación**: `ts-fsrs` ejecutándose en el cliente.
- **Ventaja**: Permite calcular intervalos de repaso (`stability`, `difficulty`, `due`) localmente sin depender de llamadas al servidor, ideal para el modo offline.

### Validación y Rating
- **Levenshtein**: Uso de `fast-levenshtein` para tolerar typos y no penalizar al usuario por errores de dedo.
- **Manejo de Tiempos**: 
    - **< 4s**: Easy (si es correcto).
    - **Ajuste de Ingeniería**: El temporizador debe **detenerse** en cuanto el usuario presiona la primera tecla para evitar penalizar la velocidad de escritura.


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

1. **Local-First**: Toda acción de estudio se registra primero en `Dexie.js`.
2. **Sincronización (Sync)**: La app detecta el estado de red. Al recuperar conexión, envía los cambios acumulados de `user_progress` a Supabase.
3. **Versionado de Contenido**: La tabla `verbs` incluye un campo `vsn` (versionado). La app solo descarga actualizaciones de mazos si la versión remota es superior a la local.

## 7. Multimedia y Almacenamiento
- **Online**: Carga perezosa (Lazy Loading) de imágenes y pre-fetching de audios desde Supabase Storage.
- **Offline**: Almacenamiento de archivos multimedia como Blobs en IndexedDB para asegurar que las tarjetas tengan audio e imagen sin internet.

---
*Nota: Se mantiene Next.js como núcleo para facilitar la escalabilidad hacia una plataforma web completa y permitir su futuro empaquetado como aplicación móvil nativa.*
