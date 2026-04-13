# Archive: offline-real-and-precision

**Archived:** 2026-04-12
**Status:** ✅ Complete — Verified & Archived

---

## What Was Done

This change bridged two gaps in Macitta's offline infrastructure and added a user-facing precision metric:

1. **Offline Session Queuing** — Removed `navigator.onLine` guards from `useSessionManager.startSession` and `endSession`. Sessions now queue `start_session`, `end_session`, and `increment_session_time` ops to Dexie's `syncQueue` when offline, using client-side `crypto.randomUUID()` IDs. The existing `useSync` hook replays these ops on reconnect.

2. **Local Study Logs** — `saveReview` in `studyReviewService.ts` now dual-writes to `db.studyLogs` in addition to the existing `syncQueue` insert, enabling future offline reads of review history.

3. **Personal Precision** — `useUserStats` now runs a 4th parallel Supabase query to `study_logs` and computes precision as `Math.round((sum(accuracy) / count) * 100)`. `ProfileClient.tsx` displays it as a percentage instead of the previous hardcoded `"—"`.

## Files Modified

| File | Change |
|------|--------|
| `apps/web/hooks/useSessionManager.ts` | Replaced `navigator.onLine` guards with online/offline branching; added Dexie syncQueue queuing for session ops |
| `apps/web/lib/studyReviewService.ts` | Added `db.studyLogs.add()` dual-write after existing `syncQueue` insert |
| `apps/web/hooks/useUserStats.ts` | Added `precision: number \| null` to `UserStats` interface; added 4th parallel `study_logs` query with error isolation; implemented precision computation |
| `apps/web/app/(app)/usuario/ProfileClient.tsx` | Replaced hardcoded `"—"` precision with dynamic display (loading → `"—"`, null → `"Sin datos"`, number → `"N%"`) |

## Deviations from Plan

**None.** All 10 tasks were completed as specified. All 9 requirements (REQ-1 through REQ-9) covering 25 scenarios were satisfied: 23 fully PASS, 2 PARTIAL (pre-existing `useSync` infrastructure not modified by this change).

## Technical Decisions & Trade-Offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **ADR-1:** `navigator.onLine` read directly in `useSessionManager` | Minimal change; no hook API refactoring needed; only needed at call time | Does not benefit from `useNetworkStatus` reactive state (irrelevant for synchronous branching) |
| **ADR-2:** `crypto.randomUUID()` for offline session IDs | Clean correlation across start/end/increment ops; no post-sync reconciliation needed | Theoretical UUID collision risk (negligible with v4); Supabase uniqueness constraint recommended as follow-up |
| **ADR-3:** Dual-write `db.studyLogs.add()` in same sync block | Enables offline reads without schema migration; synchronous block keeps writes aligned | Three writes per review instead of two (negligible IndexedDB overhead); potential divergence if one write throws (mitigated by same call stack; future: Dexie transaction) |
| **ADR-4:** `study_logs` query wrapped in `.catch()` | Precision is nice-to-have; failure must not break streak/time/mastery display | Slightly more verbose query code |

## Verification Summary

| Gate | Result |
|------|--------|
| Type Check (`tsc --noEmit`) | ✅ PASS — 0 errors |
| Build (`next build`) | ✅ PASS — 6.2s, 17/17 pages |
| Tests (`vitest run`) | ✅ PASS — 64/64 |
| Spec Validation | ✅ 23/25 PASS, 2 PARTIAL, 0 FAIL |

The 2 PARTIAL marks relate to REQ-4 (sync replay behavior) — pre-existing `useSync` infrastructure, not modified by this change. Queue ops are correctly structured for the existing sync processor.

## Rollback

- `git revert` the merge commit or delete the branch
- No Dexie schema migration to reverse
- No data migration to reverse
- After rollback: offline sessions silently dropped again (pre-existing behavior), precision returns to `"—"`

## Follow-Up Recommendations

1. **Add uniqueness constraint** on `study_sessions.id` in Supabase as a safety net against UUID collisions
2. **Wrap dual-write in Dexie transaction** (`db.transaction('rw', [db.studyLogs, db.syncQueue], ...)`) for stronger atomicity in `saveReview`
3. **Add offline read path** for precision display — query `db.studyLogs` locally when network is unavailable
4. **Add test infrastructure** for `apps/web` hooks and components (currently only `packages/shared` has tests)
