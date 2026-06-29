# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.4.0] - Portfolio delivery refactor (2026-06-28)

### Added
- TOEFL Reading, Grammar and Listening content with flexible and strict modes.
- Recent TOEFL attempt history and per-exam best scores.
- Versioned TOEFL audio fixtures for reproducible Supabase deployments.
- Complete migration history recovered from the linked production project.
- Deployment and operational verification documentation.

### Changed
- Dashboard information architecture now prioritizes the next study action.
- TOEFL list, practice and result screens use quieter product surfaces, clearer hierarchy and stronger accessibility states.
- Text and placeholder contrast increased across the design token system.
- Password updates now match signup's eight-character minimum.

### Fixed
- Public signup no longer requires an `@upt.edu.mx` email or writes the removed `role` column.
- TOEFL Listening no longer references a missing audio object.
- Removed direct client execution from the profile trigger and deleted the orphaned classroom helper.
- Removed the broad Storage policy that allowed listing the public TOEFL bucket.
- Removed generated Supabase and Turborepo state from version control.

### Known platform setting
- Supabase leaked-password protection may require a paid project plan and remains an Auth dashboard setting.

---

## [Unreleased] — feature/offline-real-and-precision

### Added
- **Offline Session Queuing:** `useSessionManager.startSession` and `endSession` now
  queue `start_session`, `end_session`, and `increment_session_time` operations to
  Dexie's `syncQueue` when the device is offline. Session IDs are generated client-side
  via `crypto.randomUUID()` and replayed by `useSync` on reconnect. No session data is
  silently dropped anymore.
- **Local Study Logs:** `saveReview` now dual-writes to `db.studyLogs` in addition to
  the existing `syncQueue` insert. This enables future offline reads of review history.
- **Personal Precision Metric:** `useUserStats` now queries `study_logs` and computes
  precision as `Math.round((sum(accuracy) / count) * 100)`. Profile page displays the
  value as a percentage (e.g. `85%`), `"Sin datos"` when no logs exist, or `"—"` while
  loading.

### Changed
- **useSessionManager:** Removed `navigator.onLine` early-return guards. Connectivity
  check now branches to Supabase (online) or Dexie syncQueue (offline).
- **ProfileClient:** Precision stat card replaced from hardcoded `"—"` to dynamic value
  sourced from `useUserStats`.

### Technical Notes
- No Dexie schema migrations — all tables (`studyLogs`, `syncQueue`) already existed.
- No Supabase schema changes — all tables and RLS policies already in place.
- `study_logs` query in `useUserStats` is wrapped in its own `.catch()` to isolate
  failures from other stats.

---

## [Unreleased] — feature/css-security-hardening

### Fixed
- **IDE Warnings:** Created `.vscode/tailwind.css-data.json` — VS Code CSS Language
  Server now correctly recognizes all Tailwind v4 at-rules (`@theme`, `@apply`,
  `@layer`, `@source`, `@utility`, `@variant`, `@custom-variant`).
- **DB Performance:** Consolidated duplicate permissive SELECT policies on `classrooms`
  table into a single `classrooms_select_authenticated` policy, resolving Supabase
  Advisor WARN `multiple_permissive_policies`.

---

## [1.3.0] — Security Hardening (2026-04-03)

### Security
- **RLS Hardening:** Eliminated anonymous access on all critical tables (`cards`,
  `decks`, `user_items`, `card_slots`, `verbs`). All policies now require `authenticated` role.
- **Search Path Injection Fix:** Patched all 7 `SECURITY DEFINER` functions with
  explicit `SET search_path = public, pg_temp` to prevent schema injection attacks.
- **Policy Consolidation:** Merged redundant overlapping RLS policies across all
  tables for better maintainability and performance.
- **Missing Indexes:** Added covering indexes on all foreign key columns that were
  missing index coverage (`classroom_id`, `user_id`, `card_id`, etc.).
- **Auth Security:** Enabled Secure Email Change and Secure Password Change in
  Supabase Auth. Minimum password length set to 8 characters with letters+digits requirement.

---

## [1.2.0] — Teacher Portal & Classroom System (2026-03-16)

### Added
- **Classroom Management:** Teachers can create classrooms with unique `join_code`,
  manage student enrollment, and delete classrooms.
- **Student Join Flow:** Students join classrooms via code with a single form.
  Immediate UI feedback on success or invalid codes.
- **Teacher Analytics:** Teachers can view study stats (`study_sessions`, `study_logs`)
  for all students in their classrooms.
- **Classmate Visibility:** Students can see the profiles of peers in shared classrooms
  for a sense of community.
- **Onboarding Modal:** First-login experience that detects new users and guides them
  through their first steps (join a class or start studying).
- **Role System:** Automatic role assignment (`student` / `teacher`) based on
  institutional email format via `update_profile_role_from_email` DB trigger.

---

## [1.1.0] — SREM Engine v2 (2026-04-02)

### Changed
- **SREM Algorithm Overhaul** (`packages/shared/src/sem.ts`):
  - **9-step growth curve:** `[0, 1, 3, 7, 16, 35, 75, 150, 365]` days — replaces
    binary SM-2 style intervals.
  - **Slot-weighted grading:** Partial credit (e.g. 2/3 slots correct) produces a
    proportional grade instead of binary pass/fail.
  - **Proportional penalties:** Missed slots reduce stability proportionally rather
    than triggering a hard reset to step 0.
  - **Hard grade recalibration:** Hard responses step back one level and recalibrate
    the anchor date to preserve fairness.
  - **Lapse-based progression cap:** Cards with ≥3 lapses are capped at step 5
    (35-day interval) to prevent runaway inflation on weak items.
  - **Configurable time thresholds:** Response time brackets (fast/medium/slow) are
    tunable via constructor options.

---

## [1.0.0] — V1: Estudio Integrado & Offline First (2026-02-15)

### Features
- **Offline-First Engine:** 
  - Implementación de `Dexie.js` como base de datos local (IndexedDB).
  - Sincronización inteligente: Los datos se cargan desde Dexie instantáneamente y se refrescan desde Supabase en segundo plano.
  - Cola de sincronización (`syncQueue`) para persistir progresos realizados sin conexión.
  - Componente `SyncManager` para visualización de estado (Sincronizado/Offline/Sincronizando) y forzado manual.
- **Sistema de Estudio FSRS:**
  - Integración completa del algoritmo FSRS para la gestión de intervalos de repaso.
  - Registro automático de sesiones de estudio (`study_sessions`) y logs individuales (`study_logs`).
  - Fallback local: Si Supabase falla o no hay red, la sesión continúa usando datos locales.
- **Dashboard Estadístico:**
  - Visualización basada en Bento Cards con datos reales.
  - Gráficos de actividad y cálculo de racha.
- **PWA Ready:**
  - Manifiesto configurado y service workers optimizados para funcionamiento offline.
  - Iconos y metadatos pulidos para una experiencia nativa.

### Optimización y Refactorización
- **Tech Stack:** Actualización a Tailwind CSS v4 para un diseño más limpio y moderno.
- **UX:** Implementación de micro-animaciones y estados activos para mejorar el "feel" de la aplicación.
- **Git:** Limpieza del repositorio y configuración de `.gitignore` para monorepo.

### Version v1 prueba de estudio (2026-02-03)

#### Features
- **Study Interface:** Implementada la interfaz de estudio activa (`/estudio`) conectada a Supabase.
- **StudyCard Component:**
  - Soporte para múltiples slots de respuesta (Infinitivo, Pasado Simple, Participio).
  - Feedaback visual instantáneo (Verde/Rojo).
  - **Navegación por Teclado:** 
    - `Enter`: Avanzar de input -> Comprobar -> Siguiente Tarjeta.
    - `Backspace`: Regresar al input anterior si el actual está vacío.
- **Lógica de Validación:**
  - Soporte estricto para `match_type`:
    - 'any': Acepta sinónimos (ej: "begin" o "start").
    - 'all': (Preparado) Requerirá todas las respuestas correctas.
  - Implementado en `useStudySession` hook.

#### Testing / Muestras
- **Base de Datos:**
  - Se añadieron manualmente los verbos "Empezar", "Apostar" y "Morder" para pruebas.
  - Se actualizó "Empezar" para aceptar ["begin", "start"] como prueba de la lógica `anyOf`.
- **Sesión de Estudio:**
  - Hardcoded temporalmente para cargar siempre los mismos 5 verbos para validación:
    1. Ser / Estar
    2. Vencer
    3. Empezar (Prueba de sinónimos)
    4. Apostar
    5. Morder

#### Próximos Pasos (To-Do)
- Remover la lista hardcoded de verbos y reactivar el algoritmo SRS/aleatorio.
- Implementar el guardado de progreso (Update User Progress) al terminar una carta.
- Añadir página de resultados al finalizar la sesión con estadísticas reales.
