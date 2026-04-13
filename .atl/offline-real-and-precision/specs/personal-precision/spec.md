# Personal Precision Specification — offline-real-and-precision

## ADDED Requirements

### Requirement: Precision Metric Computation

The `useUserStats` hook MUST compute a `precision` value by querying the user's `study_logs` from Supabase and applying the formula: `Math.round((sum(accuracy) / count) * 100)`. If the user has no study logs, `precision` MUST be `null`.

#### Scenario: Precision computed from existing study logs

- GIVEN the user has 3 study log entries with accuracy values of `0.85`, `1.0`, and `0.70`
- WHEN `useUserStats` fetches stats and queries `study_logs`
- THEN `stats.precision` is calculated as `Math.round(((0.85 + 1.0 + 0.70) / 3) * 100)`
- AND the result is `85`
- AND the `precision` field is a number (not `null`)

#### Scenario: Precision is null when no study logs exist

- GIVEN the user has zero study log entries in Supabase
- WHEN `useUserStats` fetches stats and queries `study_logs`
- THEN `stats.precision` is `null`
- AND the other stats (`streak`, `totalTimeMs`, `masteredCards`, `totalCards`, `dailyActivity`) are still computed normally

#### Scenario: Precision with a single study log

- GIVEN the user has exactly 1 study log entry with accuracy `0.92`
- WHEN `useUserStats` fetches stats
- THEN `stats.precision` is `Math.round((0.92 / 1) * 100)` = `92`

#### Scenario: Precision rounds to nearest integer

- GIVEN the user has study logs whose average accuracy yields a non-integer percentage (e.g., average `0.666...`)
- WHEN `stats.precision` is computed
- THEN the value is rounded to the nearest integer using `Math.round()`
- AND the result is always a whole number between `0` and `100` inclusive

### Requirement: Precision Query Execution

The `useUserStats` hook MUST execute a 4th parallel Supabase query to `study_logs` alongside the existing 3 queries (`study_sessions`, `user_items`, `cards`), fetching `accuracy` values for the authenticated user only.

#### Scenario: study_logs query runs in parallel with other stats queries

- GIVEN the user is authenticated
- WHEN `fetchStats()` is invoked
- THEN a `Promise.all` executes 4 queries in parallel: `study_sessions`, `user_items`, `cards`, and `study_logs`
- AND the `study_logs` query selects `accuracy` and filters by the user's `id`
- AND the hook waits for all 4 queries before computing `stats`

#### Scenario: study_logs query handles empty result gracefully

- GIVEN the Supabase `study_logs` query returns an empty array for the user
- WHEN the stats computation runs
- THEN `precision` is set to `null`
- AND no error is thrown or logged

#### Scenario: study_logs query error does not break other stats

- GIVEN the `study_logs` Supabase query fails (network error, RLS rejection, etc.)
- WHEN `fetchStats()` is invoked
- THEN the error is caught and logged
- AND `precision` is set to `null`
- AND the remaining stats (`streak`, `totalTimeMs`, etc.) are still displayed from the other successful queries

### Requirement: UserStats Interface Extension

The `UserStats` interface MUST be extended with a new `precision` field of type `number | null` to accommodate the computed precision metric.

#### Scenario: UserStats includes precision field

- GIVEN the `UserStats` interface definition in `useUserStats.ts`
- WHEN the interface is reviewed
- THEN it includes the field `precision: number | null`
- AND the existing fields (`streak`, `totalTimeMs`, `masteredCards`, `totalCards`, `dailyActivity`) remain unchanged

### Requirement: ProfileClient Precision Display

The `ProfileClient` component MUST display the computed `stats.precision` value in the "Precisión" stat card, replacing the hardcoded `"—"` placeholder. When `precision` is `null`, it MUST display `"Sin datos"` as the fallback.

#### Scenario: ProfileClient displays numeric precision

- GIVEN `stats.precision` is a number (e.g., `85`)
- WHEN `ProfileClient` renders the stats row
- THEN the "Precisión" stat card shows `"85%"`
- AND the display follows the same format as other numeric stats (value + suffix)

#### Scenario: ProfileClient displays fallback when no precision data

- GIVEN `stats.precision` is `null` (user has no study logs)
- WHEN `ProfileClient` renders the stats row
- THEN the "Precisión" stat card shows `"Sin datos"` instead of the previous hardcoded `"—"`

#### Scenario: ProfileClient displays fallback during loading

- GIVEN `stats` is still loading (`statsLoading` is `true`)
- WHEN `ProfileClient` renders the stats row
- THEN the "Precisión" stat card shows `"—"` (consistent with other stats' loading state)

#### Scenario: ProfileClient precision display edge values

- GIVEN `stats.precision` is `0` (user has study logs but all with `0` accuracy)
- WHEN `ProfileClient` renders
- THEN the "Precisión" stat card shows `"0%"`
- AND this is distinguished from the `null` case which shows `"Sin datos"`

- GIVEN `stats.precision` is `100` (user has perfect accuracy across all logs)
- WHEN `ProfileClient` renders
- THEN the "Precisión" stat card shows `"100%"`
