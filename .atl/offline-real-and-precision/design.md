# Design: offline-real-and-precision

## Architecture Overview

This change bridges two gaps in Macitta's offline infrastructure. First, **Offline Real**: `useSessionManager` currently uses `navigator.onLine` guards that silently drop session start/end events when offline, returning `null` and `0` respectively. The Dexie `syncQueue` and `useSync` hook already support all 5 operation types (`start_session`, `end_session`, `increment_session_time`, `upsert_user_item`, `insert_study_log`), but the calling code never queues them. We remove those guards, generate session IDs client-side via `crypto.randomUUID()` when offline, and queue the appropriate operations. For `saveReview`, we add the missing `db.studyLogs.add()` call so local reads have data.

Second, **Personal Precision**: The `useUserStats` hook fetches `study_sessions`, `user_items`, and `cards` but never queries `study_logs`. We add a 4th parallel Supabase query and compute precision as `Math.round((sum(accuracy) / count) * 100)`, exposing it via `UserStats.precision: number | null`. `ProfileClient.tsx` replaces the hardcoded `"—"` placeholder with this value, falling back to `"Sin datos"` when null and `"—"` while loading.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  useStudySession (orchestrator)                                 │
│  ├─ uses useSessionManager → startSession / endSession          │
│  ├─ calls saveReview (after each card)                          │
│  └─ uses useNetworkStatus → isOffline                           │
└──────────┬──────────────────────────┬───────────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│  useSessionManager  │    │  saveReview                 │
│  (modified)         │    │  (modified)                 │
│                     │    │                             │
│  online ──> Supabase│    │  ┌─ db.userItems.put       │
│  offline ──> Dexie  │    │  ├─ db.syncQueue.add (SRS) │
│    syncQueue        │    │  ├─ db.syncQueue.add (log) │
│                     │    │  └─ db.studyLogs.add ←NEW  │
│  sessionId =        │    └──────────┬──────────────────┘
│    crypto.randomUUID()              │
│    when offline         ┌───────────▼──────────────────┐
└──────────┬──────────────┤  Dexie DB                    │
           │              │  ├─ syncQueue ← ops queued   │
           │              │  ├─ studyLogs ← dual-write   │
           │              │  ├─ userItems                │
           │              │  └─ cards                    │
           │              └──────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────────────────┐
│  useSync (existing — no changes)                             │
│  ├─ polls syncQueue every 30s when online                    │
│  ├─ processes: start_session → Supabase insert (with client  │
│  │   ID), increment_session_time → RPC, end_session → update │
│  └─ retries up to 5 times, then drops                        │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐     ┌──────────────────────────┐
│  useUserStats (modified)    │     │  ProfileClient (modified)│
│                             │     │                          │
│  4 parallel Supabase queries│     │  stats row:              │
│  ├─ study_sessions          │────>│  ├─ Racha: {streak}d     │
│  ├─ user_items              │     │  ├─ Tiempo: {time}       │
│  ├─ cards                   │     │  ├─ Maestría: {pct}%     │
│  └─ study_logs ←NEW         │     │  └─ Precisión: {prec}%   │
│                             │     │    or "Sin datos" / "—"  │
│  Computes: precision =      │     └──────────────────────────┘
│    round(sum(acc)/count*100)│
│    or null if no logs       │
└─────────────────────────────┘
```

## Sequence Diagrams

### Flow: Offline Session Lifecycle (start → study → end → sync)

```
User              useStudySession     useSessionManager        Dexie DB          Supabase
 │                      │                      │                   │                 │
 │── start deck ───────>│                      │                   │                 │
 │                      │── startSession() ───>│                   │                 │
 │                      │                      │── getUser() ─────>│                 │
 │                      │                      │<── user ──────────│                 │
 │                      │                      │                   │                 │
 │                      │                      │ [navigator.offline]                │
 │                      │                      │── crypto.randomUUID()               │
 │                      │                      │── syncQueue.add({                  │
 │                      │                      │   type: "start_session",           │
 │                      │                      │   data: { session_id, ... }        │
 │                      │                      │ }) ──────────────>│                 │
 │                      │                      │<── ok ────────────│                 │
 │                      │<── sessionId ────────│                   │                 │
 │                      │                      │                   │                 │
 │── study cards ──────>│                      │                   │                 │
 │                      │── saveReview() ─────>│ (studyReviewService)                │
 │                      │                      │── userItems.put() │                 │
 │                      │                      │── syncQueue.add({ │                 │
 │                      │                      │   type: "insert_study_log" })──────>│
 │                      │                      │── studyLogs.add() │                 │
 │                      │                      │   ←NEW───────────>│                 │
 │                      │<── { grade } ────────│                   │                 │
 │                      │                      │                   │                 │
 │── end deck ─────────>│                      │                   │                 │
 │                      │── endSession(stats) ─>│                   │                 │
 │                      │                      │ [navigator.offline]                │
 │                      │                      │── syncQueue.add({ │                 │
 │                      │                      │   type: "end_session",             │
 │                      │                      │   data: { session_id, ended_at,    │
 │                      │                      │          total_cards, ... } }) ───>│
 │                      │                      │── syncQueue.add({ │                 │
 │                      │                      │   type: "increment_session_time",  │
 │                      │                      │   data: { session_id, time_ms } })│
 │                      │                      │                  ─>│                │
 │                      │<── totalDuration ────│                   │                 │
 │                      │                      │                   │                 │
 │                      │                      │       ... device goes online ...    │
 │                      │                      │                   │                 │
 │                      │                      │  useSync (30s interval)             │
 │                      │                      │── syncQueue.toArray() ─────────────>│
 │                      │                      │<── ops ────────────│                │
 │                      │                      │                   │                 │
 │                      │                      │── process each op in order ────────>│
 │                      │                      │   start_session:   INSERT into      │
 │                      │                      │     study_sessions (client ID)      │
 │                      │                      │   increment_session_time: RPC call  │
 │                      │                      │   end_session:     UPDATE record    │
 │                      │                      │<── ok ────────────│                 │
 │                      │                      │── syncQueue.delete(op.id) ────────>│
 │                      │                      │<── deleted ───────│                 │
```

### Flow: Precision Calculation Pipeline

```
ProfileClient         useUserStats              Supabase            statsCalculator
    │                      │                        │                     │
    │── mount ────────────>│                        │                     │
    │                      │── fetchStats() ────────>│                     │
    │                      │   getUser()             │                     │
    │                      │   user.id               │                     │
    │                      │                        │                     │
    │                      │── Promise.all([ ───────>│                     │
    │                      │   1. study_sessions     │                     │
    │      (existing)      │      .select(started_at,│                     │
    │                      │       total_time_ms)    │                     │
    │                      │                        │                     │
    │                      │   2. user_items         │                     │
    │      (existing)      │      .select(state)     │                     │
    │                      │                        │                     │
    │                      │   3. cards              │                     │
    │      (existing)      │      .select(*, count)  │                     │
    │                      │                        │                     │
    │                      │   4. study_logs  ←NEW   │                     │
    │                      │      .select(accuracy)  │                     │
    │                      │      .eq(user_id)       │                     │
    │                      │  ]) ───────────────────>│                     │
    │                      │                        │                     │
    │                      │<── [sessions, items,    │                     │
    │                      │     cards, logs] ───────│                     │
    │                      │                        │                     │
    │                      │── compute precision:    │                     │
    │                      │   if logs.length === 0  │                     │
    │                      │     → precision = null  │                     │
    │                      │   else                  │                     │
    │                      │     precision = round(  │                     │
    │                      │       sum(accuracy) /   │                     │
    │                      │       count * 100)      │                     │
    │                      │                        │                     │
    │                      │── setStats({            │                     │
    │                      │   streak, totalTimeMs,  │                     │
    │                      │   masteredCards,        │                     │
    │                      │   totalCards,           │                     │
    │                      │   dailyActivity,        │                     │
    │                      │   precision ←NEW        │                     │
    │                      │ })                     │                     │
    │                      │                        │                     │
    │<── render stats ──── │                        │                     │
    │   precision:         │                        │                     │
    │   loading ? "—" :    │                        │                     │
    │   null ? "Sin datos":│                        │                     │
    │   `${precision}%`    │                        │                     │
```

### Flow: Online Session (unchanged behavior, shown for completeness)

```
User              useStudySession     useSessionManager        Supabase
 │                      │                      │                 │
 │── start deck ───────>│                      │                 │
 │                      │── startSession() ───>│                 │
 │                      │                      │ [navigator.online]
 │                      │                      │── study_sessions.insert({
 │                      │                      │   user_id, deck_id, started_at
 │                      │                      │ }).select() ────>│
 │                      │                      │<── { id, ... } ─│
 │                      │<── server sessionId ─│                 │
 │                      │                      │                 │
 │── end deck ─────────>│                      │                 │
 │                      │── endSession(stats) ─>│                 │
 │                      │                      │ [navigator.online]
 │                      │                      │── study_sessions.update({
 │                      │                      │   ended_at, total_cards,
 │                      │                      │   correct_cards, total_time_ms
 │                      │                      │ }).eq(id) ──────>│
 │                      │                      │<── ok ──────────│
 │                      │<── totalDuration ────│                 │
```

## Key Decisions

### ADR-1: Use `navigator.onLine` directly in `useSessionManager` instead of `useNetworkStatus`

**Context**: `useSessionManager` currently reads `navigator.onLine` inline (not via a hook). The `useNetworkStatus` hook exists and provides reactive `isOnline`/`isOffline` state, but converting `useSessionManager` to use it would change its API (it would need to return `isOnline` or accept it as a parameter).

**Decision**: Keep reading `navigator.onLine` directly at call time inside `startSession` and `endSession`. Replace the early-return guards with conditional branching: if online, call Supabase; if offline, queue to Dexie.

**Rationale**: `navigator.onLine` is sufficient for this synchronous decision point. The `useStudySession` hook already imports `useNetworkStatus` for its own `isOffline` state, so UI-level reactivity to connectivity is already covered. `useSessionManager` only needs the instantaneous value at call time to decide which write path to take.

**Consequences**:
- (+) Minimal change — no hook refactoring, no API changes to `useSessionManager`
- (+) `navigator.onLine` is always available in browser context (SSR is not a concern for this hook)
- (−) Does not benefit from `useNetworkStatus`'s event listener reactivity, but this is irrelevant since the check happens at call time, not render time

### ADR-2: Session ID generation strategy — client-side UUID for offline, server-generated for online

**Context**: When online, Supabase generates the session ID on insert (via `study_sessions.id` column). When offline, there's no server to generate an ID, but we still need an ID to correlate `start_session`, `increment_session_time`, and `end_session` ops in the queue.

**Decision**: Generate `crypto.randomUUID()` client-side when offline. When online, let Supabase generate the ID as before. The client-generated UUID is included in the `start_session` op data, and `useSync` passes it as the `id` field when inserting into Supabase.

**Rationale**: `crypto.randomUUID()` has astronomically low collision probability. The `useSync` handler already supports inserting with a client-provided `id` (it does `insert({ id: op.data.session_id, ... })`). This avoids the need for a placeholder ID or later reconciliation.

**Consequences**:
- (+) Clean correlation between start/end ops — same ID throughout
- (+) No need for post-sync ID reconciliation
- (−) Theoretical collision risk (negligible with UUID v4)
- (−) Supabase `study_sessions.id` should have a uniqueness constraint as a safety net (separate follow-up)

### ADR-3: Dual-write in `saveReview` — `db.studyLogs.add()` alongside existing `syncQueue` queuing

**Context**: `saveReview` already queues `insert_study_log` to `syncQueue` (which eventually writes to Supabase). The `db.studyLogs` Dexie table exists in the schema but is never written to, making it an unused local read path.

**Decision**: Add `db.studyLogs.add()` as a third write in `saveReview` (after `userItems.put` and `syncQueue.add` for SRS, alongside `syncQueue.add` for study log). The data written to `db.studyLogs` mirrors the `insert_study_log` op data exactly.

**Rationale**: The Dexie table exists but is empty — writing to it enables future offline reads without any schema migration. The write is synchronous with the `syncQueue` add, so they succeed or fail together within the same call stack.

**Consequences**:
- (+) Enables offline reads of review history (future capability)
- (+) No schema migration needed — table already exists with correct shape
- (−) Three writes per review instead of two — negligible overhead (all Dexie, all IndexedDB-backed)
- (−) Potential for divergence if one write succeeds and another fails — mitigated by same synchronous block; future: wrap in Dexie transaction

### ADR-4: Precision query error isolation — `study_logs` failure must not break other stats

**Context**: Adding a 4th parallel query to `Promise.all` means if any query rejects, the entire `Promise.all` rejects, and no stats are displayed.

**Decision**: Wrap the `study_logs` query in its own `.catch()` block so that a failure returns `null` precision but does not reject the `Promise.all`. The other three queries remain unaffected.

**Rationale**: Precision is a nice-to-have metric; streak, time, and mastery are more critical. The spec explicitly requires this isolation behavior.

**Consequences**:
- (+) Precision failure is transparent — other stats still display
- (+) Error is logged for debugging
- (−) Slightly more verbose query code

## Data Model Changes

| Entity | Change | Description |
|--------|--------|-------------|
| `UserStats` (TypeScript interface) | Modify | Add `precision: number \| null` field |
| `db.studyLogs` (Dexie table) | Write (no schema change) | `saveReview` now writes records here; table already exists |
| `syncQueue` (Dexie table) | Write (no schema change) | `useSessionManager` now queues `start_session`, `end_session`, `increment_session_time` ops; types already exist |

No Dexie schema migrations required. No Supabase schema changes required.

## API Changes

| Endpoint/Method | Change | Description |
|-----------------|--------|-------------|
| `useSessionManager.startSession(deckId)` | Modify | When offline: queues `start_session` op to `syncQueue`, returns client-generated UUID instead of `null`. When online: unchanged (Supabase insert). |
| `useSessionManager.endSession(stats)` | Modify | When offline: queues `end_session` + `increment_session_time` ops to `syncQueue`, returns calculated `totalDuration` instead of `0`. When online: unchanged (Supabase update). |
| `saveReview(params)` | Modify | Adds `db.studyLogs.add()` call after existing `syncQueue.add("insert_study_log")`. Data mirrors the queued op. |
| `useUserStats.fetchStats()` | Modify | Adds 4th parallel query to `study_logs`; computes `precision` and includes it in returned `UserStats`. |
| `UserStats` interface | Modify | New field: `precision: number \| null`. |
| `ProfileClient.tsx` stats row | Modify | Replaces hardcoded `value: '—'` for "Precisión" with dynamic display: `"—"` when loading, `"Sin datos"` when `precision === null`, `` `${precision}%` `` when numeric. |

## Implementation Details

### 1. `useSessionManager.ts` — Session ID Generation Change

**Current flow (online)**: `supabase.from("study_sessions").insert(...).select().single()` → returns server-generated `data.id`.

**New flow (offline)**: Call `crypto.randomUUID()` before queuing. Store the generated ID in `sessionIdRef.current` and return it. The same ID is used in `endSession` when queuing `end_session` and `increment_session_time` ops.

```typescript
// startSession — offline path
const clientSessionId = crypto.randomUUID();
sessionIdRef.current = clientSessionId;
setSessionId(clientSessionId);
sessionStartTime.current = Date.now();

await db.syncQueue.add({
    type: "start_session",
    data: {
        session_id: clientSessionId,
        user_id: user.id,
        deck_id: deckId,
        started_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
});

return clientSessionId;
```

### 2. `useSessionManager.ts` — Replacing `navigator.onLine` Guards

**Before**: `if (!user || !navigator.onLine) return null;` — short-circuits and drops the event.

**After**: Branch on connectivity:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;  // still guard on auth

if (navigator.onLine) {
    // existing Supabase path
} else {
    // new Dexie syncQueue path
}
```

Same pattern for `endSession`: replace `if (!currentSessionId || !navigator.onLine) return 0;` with a connectivity branch.

### 3. `studyReviewService.ts` — Dual-Write to `db.studyLogs`

Add after the existing `syncQueue.add("insert_study_log")` call:

```typescript
// 2. Always log study activity (counts toward stats/streak)
const logData = {
    user_id: userId,
    card_id: cardId,
    session_id: sessionId,
    grade: semResult.grade,
    time_taken_ms: timeTakenMs,
    accuracy,
    review_date: new Date().toISOString(),
};

await db.syncQueue.add({
    type: "insert_study_log",
    data: logData,
    created_at: new Date().toISOString(),
});

// NEW: Dual-write to local studyLogs for offline reads
await db.studyLogs.add(logData);
```

### 4. `useUserStats.ts` — 4th Parallel Query with Error Isolation

Add the `study_logs` query to the existing `Promise.all`, wrapped in a `.catch()` for isolation:

```typescript
const [sessionsRes, userItemsRes, totalCardsRes, logsRes] = await Promise.all([
    // ... existing 3 queries ...
    supabase
        .from('study_logs')
        .select('accuracy')
        .eq('user_id', user.id)
        .catch((err) => {
            console.error("[Stats] study_logs query error:", err);
            return { data: null, error: err };
        }),
]);

// Compute precision
const logs = logsRes?.data ?? [];
const precision = logs.length > 0
    ? Math.round((logs.reduce((sum, l) => sum + (l.accuracy ?? 0), 0) / logs.length) * 100)
    : null;
```

### 5. `ProfileClient.tsx` — Precision Display

Replace the hardcoded precision stat:

```typescript
// Before:
{ label: 'Precisión', value: '—', icon: Target, color: 'text-green-400' },

// After:
{
    label: 'Precisión',
    value: statsLoading
        ? '—'
        : stats?.precision !== null && stats?.precision !== undefined
            ? `${stats.precision}%`
            : 'Sin datos',
    icon: Target,
    color: 'text-green-400',
},
```

## Non-Functional Requirements

| Requirement | How Addressed |
|-------------|---------------|
| **Data integrity (offline)** | Session ops queued with client-generated UUIDs; same ID used across start/end/increment ops. `useSync` processes in order by `syncQueue.id` (auto-increment). |
| **Data integrity (dual-write)** | `saveReview` writes to `db.studyLogs` and `db.syncQueue` in the same synchronous block. If either throws, the function fails and neither completes. |
| **Query resilience** | `study_logs` query wrapped in `.catch()` — failure sets `precision = null` without breaking other stats. |
| **Performance** | Precision query is a simple `SELECT accuracy WHERE user_id = ?` — no joins, no subqueries. IndexedDB writes are async and non-blocking. |
| **Backwards compatibility** | Online behavior is unchanged — same Supabase calls, same return values. `UserStats.precision` is additive (new field, existing fields untouched). |
| **No schema migrations** | All Dexie tables (`studyLogs`, `syncQueue`) and Supabase tables (`study_sessions`, `study_logs`) already exist with correct schemas. |
