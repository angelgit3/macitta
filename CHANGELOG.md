# Changelog

## [1.0.0] - V1: Estudio Integrado & Offline First (2026-02-15)

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
