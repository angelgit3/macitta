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
  - **SEM Core**: Sistema Espaciado Macitta — algoritmo custom de repetición espaciada.
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

### Progreso y SEM
- **`user_items`**: El estado real de la memoria del usuario para una tarjeta. Contiene parámetros SEM:
  - `stability`: Intervalo actual en días.
  - `difficulty`: Dificultad running (1-10).
  - `reps`: Paso en la curva de crecimiento SEM (0-7).
  - `lapses`: Conteo de olvidos (Again).
  - `state`: `new` | `learning` | `review` | `mastered`.
  - `due_date`: Fecha del próximo repaso.
- **`study_logs`**: Historial atómico de cada repaso. Registra la calificación (`grade`), precisión por slots, y tiempo tomado.
- **`study_sessions`**: Bitácora agrupada de una sesión de estudio. Rastrea el tiempo total, tarjetas vistas y precisión por "sentada".

---

## 3. Lógica de Aprendizaje (SEM — Sistema Espaciado Macitta)

> Filosofía: "Low Friction, Long Term" — Una sesión diaria de pocos minutos basta para dominar el material a largo plazo.

### Diferenciadores del SEM
A diferencia de sistemas tradicionales (Anki/SM-2) que tratan cada respuesta como binaria, SEM entiende que el conocimiento tiene **matices**:
- **Precisión granular**: Mide accuracy por slots (2/3 ≠ 0/3).
- **Penalizaciones proporcionales**: No resetea en cada error; penaliza según gravedad.
- **Curva de dominio**: 8 pasos hacia la maestría (365 días = Dominado 🏆).

### Flujo de Calificación (Grade)
La calificación se calcula automáticamente combinando **accuracy por slots** y **tiempo de respuesta**:

| Accuracy | Tiempo | Grade | Efecto |
|---|---|---|---|
| 100% (3/3) | < 3s | **Easy** | Avanza 2 pasos |
| 100% (3/3) | 3-7s | **Good** | Avanza 1 paso |
| 100% (3/3) | > 7s | **Hard** | Penalización -15% |
| ≥ 66% (2/3) | cualquiera | **Hard** | Penalización -50% |
| < 66% (1/3) | cualquiera | **Again** | Penalización -85% |
| 0% (0/3) | cualquiera | **Again** | Reset total (paso 0) |

### Curva de Crecimiento (8 Pasos)
```
Paso 0: Hoy → Paso 1: 3 días → Paso 2: 7 días →
Paso 3: 16 días → Paso 4: 35 días → Paso 5: 75 días →
Paso 6: 150 días → Paso 7: 365 días → DOMINADO 🏆
```

### Persistencia Automática
Al enviar una respuesta, el sistema realiza tres acciones:
1. Actualiza `user_items` con los nuevos valores SEM (local Dexie).
2. Inserta un registro en `study_logs` (cola de sync).
3. Sincroniza con Supabase cuando hay conexión.

### Modo Maratón (Rush Mode) 🔥
Disponible cuando el usuario completa **todas sus tarjetas pendientes** del día:
- Selecciona tarjetas por **debilidad** (mayor lapses + difficulty).
- **No modifica el SEM** — protege la memoria de largo plazo.
- **Sí registra logs** — la racha, tiempo y stats siguen contando.
- Diseñado para "cramming" antes de exámenes sin destruir el scheduling.

---

## 4. Estado Actual del Producto (Product Level)

A fecha de marzo 2026, la app cuenta con:
- **Offline-First Engine**: Sincronización robusta con Dexie.js y Supabase.
- **SEM Integrado**: Sistema Espaciado Macitta con grading granular y curva de 8 pasos.
- **Modo Maratón**: Estudio sin límites post-sesión, sin contaminar el SEM.
- **Dashboard Estadístico**: Estadísticas reales, actividad y racha de estudio.
- **Inventario**: Explorador de verbos con estado de maestría visual.
- **PWA Full**: Instalable y funcional sin red (datos previos cacheados).

---

## 5. Roadmap y Próximos Pasos (V2)

1. **Importador JSON de Mazos**: Permitir importar mazos completos con multimedia y respuestas avanzadas.
2. **Multimedia Offline**: Almacenamiento de audios y miniaturas en IndexedDB.
3. **Gamificación**: Leaderboard global y metas personalizables.
4. **Editor de Mazos**: Permitir a los usuarios crear sus propias flashcards desde la UI.
5. **Notificaciones**: Recordatorios inteligentes basados en la curva del olvido.

---
*Documentación generada para asegurar la continuidad del desarrollo entre sesiones.*
