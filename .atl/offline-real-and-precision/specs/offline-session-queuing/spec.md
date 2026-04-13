# Offline Session Queuing Specification — offline-real-and-precision

## ADDED Requirements

### Requirement: Offline Session Start Queuing

The system MUST queue a `start_session` operation to the Dexie `syncQueue` table when `startSession` is called while the device is offline, instead of silently returning `null`. The session ID MUST be generated client-side using `crypto.randomUUID()`.

#### Scenario: Offline startSession queues start_session op

- GIVEN the user's device is offline (`navigator.onLine` is `false`)
- WHEN `startSession(deckId)` is called with a valid deck ID
- THEN a `start_session` operation is inserted into `db.syncQueue`
- AND the operation data contains `session_id`, `user_id`, `deck_id`, and `started_at`
- AND the `session_id` is a valid UUID generated via `crypto.randomUUID()`
- AND the function returns the generated session ID (not `null`)

#### Scenario: Online startSession behavior unchanged

- GIVEN the user's device is online (`navigator.onLine` is `true`)
- WHEN `startSession(deckId)` is called with a valid deck ID
- THEN the session is inserted into Supabase `study_sessions` table (existing behavior)
- AND no `start_session` operation is queued to `db.syncQueue` for this call
- AND the returned session ID is the server-generated ID

#### Scenario: Offline startSession with no authenticated user

- GIVEN the user is not authenticated (no valid Supabase session)
- WHEN `startSession(deckId)` is called regardless of network state
- THEN the function returns `null` without queuing any operation
- AND no entry is added to `db.syncQueue`

### Requirement: Offline Session End Queuing

The system MUST queue both an `end_session` operation and an `increment_session_time` operation to the Dexie `syncQueue` table when `endSession` is called while the device is offline, instead of silently returning `0`. The session ID MUST be the same client-generated ID from the corresponding `startSession` call.

#### Scenario: Offline endSession queues end_session and increment_session_time ops

- GIVEN the user started a session offline (session ID exists in `sessionIdRef`)
- AND the device is currently offline (`navigator.onLine` is `false`)
- WHEN `endSession(stats)` is called with session statistics
- THEN an `end_session` operation is inserted into `db.syncQueue` with `session_id`, `ended_at`, `total_cards`, `correct_cards`, and `total_time_ms`
- AND an `increment_session_time` operation is inserted into `db.syncQueue` with `session_id` and `time_ms`
- AND the function returns the calculated `totalDuration` (not `0`)
- AND the `session_id` matches the one generated at session start

#### Scenario: Online endSession behavior unchanged

- GIVEN the user has an active session with a server-generated session ID
- AND the device is online (`navigator.onLine` is `true`)
- WHEN `endSession(stats)` is called
- THEN the `study_sessions` record is updated directly in Supabase (existing behavior)
- AND no operations are queued to `db.syncQueue` for this call
- AND the returned duration is the calculated `totalDuration`

#### Scenario: endSession with no active session

- GIVEN there is no active session (`sessionIdRef.current` is `null`)
- WHEN `endSession(stats)` is called regardless of network state
- THEN the function returns `0` without queuing any operation
- AND no entry is added to `db.syncQueue`

### Requirement: Offline Review Dual-Write to studyLogs

The system MUST write study log entries to the Dexie `db.studyLogs` table in addition to the existing `db.syncQueue` queuing when `saveReview` is called, enabling offline reads of review history.

#### Scenario: saveReview writes to both studyLogs and syncQueue

- GIVEN a user completes a card review (normal mode, not rush mode)
- WHEN `saveReview(params)` is called with valid review parameters
- THEN the SRS state is updated in `db.userItems` (existing behavior)
- AND an `insert_study_log` operation is queued to `db.syncQueue` (existing behavior)
- AND a new record is inserted into `db.studyLogs` with `user_id`, `card_id`, `session_id`, `grade`, `time_taken_ms`, `accuracy`, and `review_date`

#### Scenario: saveReview in rush mode writes studyLogs but skips SRS update

- GIVEN a user completes a card review in rush mode (`isRushMode` is `true`)
- WHEN `saveReview(params)` is called
- THEN the SRS state in `db.userItems` is NOT modified
- AND no `upsert_user_item` operation is queued to `db.syncQueue`
- AND a study log is written to `db.studyLogs`
- AND an `insert_study_log` operation is queued to `db.syncQueue`

#### Scenario: saveReview studyLog record matches syncQueue data

- GIVEN `saveReview(params)` is called with specific review data
- WHEN the function completes successfully
- THEN the record in `db.studyLogs` contains the same `user_id`, `card_id`, `session_id`, `grade`, `time_taken_ms`, `accuracy`, and `review_date` as the `insert_study_log` operation in `db.syncQueue`

### Requirement: Sync Replays Queued Session Operations

The system MUST correctly process all queued session-related operations (`start_session`, `end_session`, `increment_session_time`) from the `syncQueue` when the device comes back online, using the existing `useSync` hook infrastructure.

#### Scenario: useSync replays queued session ops on reconnect

- GIVEN the `syncQueue` contains `start_session`, `increment_session_time`, and `end_session` operations queued during offline mode
- WHEN the device comes back online and `useSync`'s periodic interval triggers (every 30 seconds)
- THEN each operation is processed in order of insertion (by ID)
- AND `start_session` inserts a `study_sessions` record into Supabase with the client-generated session ID
- AND `increment_session_time` calls the `increment_session_time` Supabase RPC
- AND `end_session` updates the `study_sessions` record with end data
- AND successfully processed operations are removed from `db.syncQueue`

#### Scenario: Failed session op retried then dropped

- GIVEN a queued `start_session` operation fails to process (e.g., Supabase error)
- WHEN `useSync` attempts to process it and it fails
- THEN the operation's `retryCount` is incremented in `db.syncQueue`
- AND after 5 consecutive failures (`MAX_RETRIES`), the operation is dropped from the queue
- AND the failure is logged via the `logger`

## MODIFIED Requirements

### Requirement: useSessionManager Online/Offline Path

The `useSessionManager` hook MUST no longer use `navigator.onLine` guards to short-circuit `startSession` and `endSession`. Instead, it MUST queue operations locally when offline and proceed with Supabase calls when online.

(Previously: `startSession` returned `null` and `endSession` returned `0` when `navigator.onLine` was `false`, silently dropping offline session data.)

#### Scenario: startSession removes online guard

- GIVEN the `startSession` function implementation
- WHEN reviewing the code
- THEN there is no `navigator.onLine` check that causes early return of `null`
- AND the function branches based on connectivity: online → Supabase insert, offline → Dexie syncQueue insert

#### Scenario: endSession removes online guard

- GIVEN the `endSession` function implementation
- WHEN reviewing the code
- THEN there is no `navigator.onLine` check that causes early return of `0`
- AND the function branches based on connectivity: online → Supabase update, offline → Dexie syncQueue insert
