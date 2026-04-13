# Tasks: offline-real-and-precision

## Phase 1: Infrastructure — Types & Interface

### Task 1.1: Extend UserStats interface with precision field
- **Description**: Add `precision: number | null` to the `UserStats` interface in `useUserStats.ts`. This is the foundational type change that all downstream precision tasks depend on.
- **Files**: `apps/web/hooks/useUserStats.ts` (modify)
- **Dependencies**: None
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] `UserStats` interface includes `precision: number | null` field
  - [ ] All existing fields (`streak`, `totalTimeMs`, `masteredCards`, `totalCards`, `dailyActivity`) remain unchanged
  - [ ] TypeScript compilation succeeds with no type errors
- **Covers**: REQ-8 (UserStats Interface Extension — 1 scenario)

---

## Phase 2: Implementation — Offline Session Queuing

### Task 2.1: Replace navigator.onLine guard in startSession with branching logic
- **Description**: In `useSessionManager.startSession`, replace the combined guard `if (!user || !navigator.onLine) return null;` with separate auth guard (`if (!user) return null;`) followed by a connectivity branch: if online → existing Supabase insert path, if offline → new Dexie syncQueue path that generates a client-side UUID via `crypto.randomUUID()`, stores it in `sessionIdRef.current` and `setSessionId`, queues a `start_session` operation to `db.syncQueue`, and returns the generated ID.
- **Files**: `apps/web/hooks/useSessionManager.ts` (modify)
- **Dependencies**: None
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] No `navigator.onLine` check causes early return of `null` in `startSession`
  - [ ] Online path unchanged: Supabase insert → returns server-generated ID
  - [ ] Offline path: `crypto.randomUUID()` generates session ID, stored in `sessionIdRef.current` and `setSessionId`
  - [ ] Offline path: `start_session` op queued to `db.syncQueue` with `session_id`, `user_id`, `deck_id`, `started_at`
  - [ ] Offline path: function returns the generated UUID (not `null`)
  - [ ] Unauthenticated user still returns `null` regardless of network state
  - [ ] No entry is added to `db.syncQueue` when user is unauthenticated
- **Covers**: REQ-1 (Offline Session Start Queuing — 3 scenarios), REQ-5 (useSessionManager Online/Offline Path — scenario 1)

### Task 2.2: Replace navigator.onLine guard in endSession with branching logic
- **Description**: In `useSessionManager.endSession`, replace the combined guard `if (!currentSessionId || !navigator.onLine) return 0;` with separate session guard (`if (!currentSessionId) return 0;`) followed by a connectivity branch: if online → existing Supabase update path, if offline → new Dexie syncQueue path that queues both an `end_session` op (with `session_id`, `ended_at`, `total_cards`, `correct_cards`, `total_time_ms`) and an `increment_session_time` op (with `session_id`, `time_ms`), then returns the calculated `totalDuration`.
- **Files**: `apps/web/hooks/useSessionManager.ts` (modify)
- **Dependencies**: Task 2.1 (startSession must already manage client-generated session IDs)
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] No `navigator.onLine` check causes early return of `0` in `endSession`
  - [ ] Online path unchanged: Supabase update → returns `totalDuration`
  - [ ] Offline path: `end_session` op queued to `db.syncQueue` with `session_id`, `ended_at`, `total_cards`, `correct_cards`, `total_time_ms`
  - [ ] Offline path: `increment_session_time` op queued to `db.syncQueue` with `session_id` and `time_ms`
  - [ ] Offline path: function returns calculated `totalDuration` (not `0`)
  - [ ] Offline path: `session_id` in queued ops matches the one generated at session start
  - [ ] No active session (`sessionIdRef.current` is `null`) still returns `0` without queuing
- **Covers**: REQ-2 (Offline Session End Queuing — 3 scenarios), REQ-5 (useSessionManager Online/Offline Path — scenario 2)

### Task 2.3: Add db.studyLogs dual-write to saveReview
- **Description**: In `studyReviewService.saveReview`, after the existing `db.syncQueue.add({ type: "insert_study_log", ... })` call, add a `db.studyLogs.add(logData)` call with the same data object. This enables offline reads of review history. The `logData` object should contain `user_id`, `card_id`, `session_id`, `grade`, `time_taken_ms`, `accuracy`, and `review_date`. This applies to both normal mode and rush mode (rush mode skips SRS but still writes study logs).
- **Files**: `apps/web/lib/studyReviewService.ts` (modify)
- **Dependencies**: None
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] Normal mode: `db.studyLogs.add()` called after `syncQueue.add("insert_study_log")` with matching data
  - [ ] Rush mode: `db.studyLogs.add()` called (SRS update skipped, but study log still written)
  - [ ] Record in `db.studyLogs` contains same `user_id`, `card_id`, `session_id`, `grade`, `time_taken_ms`, `accuracy`, `review_date` as the `insert_study_log` op in `syncQueue`
  - [ ] Existing `db.userItems.put` and `syncQueue.add("upsert_user_item")` behavior unchanged in normal mode
  - [ ] Rush mode does NOT modify `db.userItems` or queue `upsert_user_item` (existing behavior preserved)
- **Covers**: REQ-3 (Offline Review Dual-Write to studyLogs — 3 scenarios)

---

## Phase 3: Implementation — Personal Precision

### Task 3.1: Add 4th parallel study_logs query with error isolation to useUserStats
- **Description**: In `useUserStats.fetchStats`, extend the existing `Promise.all` (which runs 3 queries) to include a 4th parallel query to `study_logs` that selects `accuracy` filtered by the user's `id`. The `study_logs` query must be wrapped in its own `.catch()` block to isolate failures — on error, it should log the error via `console.error` and return `{ data: null, error: err }` so it does not reject the `Promise.all`.
- **Files**: `apps/web/hooks/useUserStats.ts` (modify)
- **Dependencies**: Task 1.1 (UserStats interface must include `precision` field)
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] `Promise.all` now executes 4 queries in parallel: `study_sessions`, `user_items`, `cards`, and `study_logs`
  - [ ] `study_logs` query selects `accuracy` and filters by `user_id`
  - [ ] `study_logs` query has its own `.catch()` handler that logs error and returns `{ data: null, error: err }`
  - [ ] Hook waits for all 4 queries before computing stats
  - [ ] `study_logs` query failure does not prevent other stats from being computed and displayed
  - [ ] Empty `study_logs` result (empty array) does not throw an error
- **Covers**: REQ-7 (Precision Query Execution — 3 scenarios)

### Task 3.2: Implement precision computation in useUserStats
- **Description**: After the `Promise.all` resolves in `fetchStats`, compute the `precision` value from the `study_logs` results using the formula: `Math.round((sum(accuracy) / count) * 100)`. If `logs.length === 0`, set `precision` to `null`. Include the computed `precision` in the `setStats` call. The precision value must always be a whole number between 0 and 100 inclusive.
- **Files**: `apps/web/hooks/useUserStats.ts` (modify)
- **Dependencies**: Task 3.1 (study_logs query must exist and return data)
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] Precision computed as `Math.round((logs.reduce((sum, l) => sum + (l.accuracy ?? 0), 0) / logs.length) * 100)` when logs exist
  - [ ] Precision is `null` when `logs.length === 0`
  - [ ] Precision with single log entry computes correctly (e.g., accuracy 0.92 → precision 92)
  - [ ] Precision with multiple entries computes correctly (e.g., [0.85, 1.0, 0.70] → precision 85)
  - [ ] Precision is always rounded to nearest integer (whole number between 0–100)
  - [ ] `setStats` call includes `precision` alongside existing fields
- **Covers**: REQ-6 (Precision Metric Computation — 4 scenarios)

### Task 3.3: Wire precision display in ProfileClient
- **Description**: In `ProfileClient.tsx`, replace the hardcoded `value: '—'` for the "Precisión" stat card with dynamic display logic: show `"—"` when `statsLoading` is `true`, show `"Sin datos"` when `stats?.precision` is `null` or `undefined`, and show `` `${stats.precision}%` `` when it is a number. This includes edge cases where precision is `0` (shows `"0%"`) or `100` (shows `"100%"`).
- **Files**: `apps/web/app/(app)/usuario/ProfileClient.tsx` (modify)
- **Dependencies**: Task 3.2 (precision must be computed and available in stats)
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] Loading state (`statsLoading === true`): displays `"—"`
  - [ ] No data state (`stats?.precision === null`): displays `"Sin datos"`
  - [ ] Numeric state (e.g., `stats.precision === 85`): displays `"85%"`
  - [ ] Edge value `0`: displays `"0%"` (distinguished from `null` case)
  - [ ] Edge value `100`: displays `"100%"`
  - [ ] Display format consistent with other numeric stats (value + suffix)
- **Covers**: REQ-9 (ProfileClient Precision Display — 4 scenarios)

---

## Phase 4: Verification

### Task 4.1: TypeScript type checking
- **Description**: Run TypeScript compilation to verify all type changes are correct across the modified files. This ensures `UserStats.precision: number | null` is properly propagated through `useUserStats` to `ProfileClient`, and that the offline branching logic in `useSessionManager` is type-safe.
- **Files**: All modified files
- **Dependencies**: Tasks 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 (all implementation tasks)
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` passes with zero errors in the `web` app
  - [ ] No implicit `any` types introduced
  - [ ] `precision` field access in `ProfileClient` is properly null-checked

### Task 4.2: ESLint linting
- **Description**: Run ESLint on all modified files to ensure code quality standards are met.
- **Files**: `apps/web/hooks/useSessionManager.ts`, `apps/web/lib/studyReviewService.ts`, `apps/web/hooks/useUserStats.ts`, `apps/web/app/(app)/usuario/ProfileClient.tsx`
- **Dependencies**: Tasks 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 (all implementation tasks)
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] `npm run lint` (or `next lint`) passes with zero errors and zero warnings in the `web` app
  - [ ] No unused imports or variables in modified files

### Task 4.3: Build verification
- **Description**: Run a full Next.js build to verify the application compiles correctly with all changes, including server-side rendering of `ProfileClient` and client-side hook behavior.
- **Files**: Entire `web` app
- **Dependencies**: Task 4.1 (type checking), Task 4.2 (linting)
- **Complexity**: Medium
- **Acceptance Criteria**:
  - [ ] `npm run build` succeeds with no errors
  - [ ] No hydration mismatch warnings related to the precision display
  - [ ] All routes including `/usuario` build successfully

### Task 4.4: Shared package test suite
- **Description**: Run the `@maccita/shared` vitest test suite to confirm no regressions in the SREM scheduling engine (unchanged by this change but should be verified as part of CI discipline).
- **Files**: `packages/shared/src/sem.test.ts`
- **Dependencies**: None (independent)
- **Complexity**: Low
- **Acceptance Criteria**:
  - [ ] `npm run test` in `packages/shared` passes all existing tests
  - [ ] No test failures or new warnings

---

## Dependency Graph

```
1.1 ──────────────────────────────┐
                                  ├──► 3.1 ──► 3.2 ──► 3.3 ──┐
2.1 ──► 2.2                      │                           ├──► 4.1 ──► 4.2 ──► 4.3
2.3                              │                           │
                                  └───────────────────────────┘

4.4 (independent — can run at any time)
```

## Summary
- **Total Tasks**: 10
- **Infrastructure**: 1 (Task 1.1)
- **Implementation**: 5 (Tasks 2.1, 2.2, 2.3, 3.1, 3.2, 3.3)
- **Verification**: 4 (Tasks 4.1, 4.2, 4.3, 4.4)
- **Estimated Complexity**: Medium — changes are well-scoped across 4 files with clear branching logic and no schema migrations. The most complex tasks are 2.1 and 2.2 (rewiring session lifecycle with offline/online branching).

## Spec Coverage Map

| Task | Requirements Covered | Scenario Count |
|------|---------------------|----------------|
| 1.1 | REQ-8 | 1 |
| 2.1 | REQ-1, REQ-5 | 4 |
| 2.2 | REQ-2, REQ-5 | 4 |
| 2.3 | REQ-3 | 3 |
| 3.1 | REQ-7 | 3 |
| 3.2 | REQ-6 | 4 |
| 3.3 | REQ-9 | 4 |
| 4.1–4.4 | REQ-4 (sync behavior via existing useSync) | 2 |
| | **Total** | **25 scenarios across REQ-1 through REQ-9** |
