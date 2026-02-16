# Macitta: Arquitectura Técnica y Estado del Proyecto

> [!IMPORTANT]
> **Documento Vivo**: Este archivo representa el estado actual del sistema. Debe actualizarse proactivamente tras cada cambio estructural significativo. Para un histórico de cambios, consulta el `CHANGELOG.md`.

## 1. Stack Tecnológico (Monorepo)

Macitta utiliza una estructura de **Monorepo** gestionada con **Turborepo** para separar la lógica de negocio de la interfaz de usuario.

- **Frontend (`apps/web`)**: 
  - Framework: Next.js 15+ (App Router).
  - Estilos: Tailwind CSS v4 (Estética Obsidian Zen).
  - Autenticación: Supabase Auth.
- **Shared Logic (`packages/shared`)**:
  - **FSRS Core**: Implementación del algoritmo *Free Spaced Repetition Scheduler*.
  - **Validación**: Lógica de Levenshtein para tolerancia de typos y validación de respuestas complejas (`anyOf`, `allOf`).
- **Backend & DB (Supabase)**:
  - Base de Datos: PostgreSQL.
  - Almacenamiento: Supabase Storage para multimedia.

---

## 2. Modelo de Datos (Esquema de Base de Datos)

El corazón del sistema de aprendizaje es la relación entre el contenido estático y el progreso dinámico del usuario.

### Persistencia y Offline (Offline-First)
- **Base de Datos Local (IndexedDB)**: `Dexie.js` actúa como el buffer principal. Todas las lecturas y escrituras de estudio ocurren primero localmente.
- **Sincronización Bidireccional**: Un sistema de `syncQueue` procesa los cambios acumulados cuando hay red.
- **Resolución de Conflictos (Opción B)**: Uso de RPCs en Supabase (`sync_user_item`) que priorizan el repaso más reciente basándose en timestamps.
- **Service Worker**: Cacheo selectivo de assets para funcionamiento 100% offline.

### Estructura Core
- **`decks`**: Agrupación lógica de tarjetas (ej. "Verbos Irregulares").
- **`cards`**: Contenido estático (la pregunta/verbo).
- **`card_slots`**: Define los campos de entrada para cada tarjeta (Infinitive, Past, Participle). Permite múltiples respuestas válidas y tipos de comparación (`any` / `all`).

### Progreso y SRS
- **`user_items`**: El estado real de la memoria del usuario para una tarjeta. Contiene parámetros FSRS: `stability`, `difficulty`, `reps`, `lapses`, `state`, y `due_date`.
- **`study_logs`**: Historial atómico de cada repaso. Registra la calificación (`grade`), precisión y tiempo tomado.
- **`study_sessions`**: Bitácora agrupada de una sesión de estudio. Rastrea el tiempo total, tarjetas vistas y precisión por "sentada".

---

## 3. Lógica de Aprendizaje (FSRS Integration)

La aplicación utiliza el algoritmo FSRS para predecir el olvido.

### Flujo de Calificación (Grade)
La calificación (0-3) se calcula automáticamente en el hook `useStudySession` combinando:
1.  **Precisión**: ¿Es correcta la respuesta según Levenshtein?
2.  **Tiempo**:
    - **< 4s**: `Easy` (Salto grande en estabilidad).
    - **4s - 8s**: `Good`.
    - **> 8s**: `Hard`.
    - **Incorrecta**: `Again` (Resetea o reduce estabilidad).

### Persistencia Automática
Al enviar una respuesta, el sistema realiza tres acciones en paralelo:
1.  Actualiza `user_items` con los nuevos valores de FSRS.
2.  Inserta un registro en `study_logs`.
3.  Incrementa el tiempo de la sesión actual en `study_sessions` mediante una función RPC (`increment_session_time`).

---

## 4. Estado Actual del Producto (Product Level)

A fecha de febrero 2026, la app cuenta con:
- **Flujo de Estudio Completo**: Desde la carga del mazo hasta la pantalla de resumen ("Misión Cumplida").
- **Dashboard Estadístico**: Visualización de racha, tiempo total de estudio y % de maestría.
- **Inventario de Vocabulario**: Explorador de los 93 verbos con su estado de aprendizaje actual.
- **Gestión de Cuenta**: Funcionalidad de cambio de contraseña y cierre de sesión integrada.
- **Preparación PWA**: Manifiesto configurado para instalación en dispositivos móviles.

---

## 5. Roadmap y Próximos Pasos

Para que el proyecto escale a un producto profesional masivo:
1.  **Multimedia Offline**: Implementar IndexedDB para cachear audios e imágenes.
2.  **Notificaciones PWA**: Recordatorios automáticos cuando las tarjetas estén `due`.
3.  **Gamificación**: Rankings de usuarios (Leaderboard) basados en la precisión y racha.
4.  **Expansión de Contenido**: Herramienta de importación masiva para nuevos mazos (phrasal verbs, idioms).

---
*Documentación generada para asegurar la continuidad del desarrollo entre sesiones.*
