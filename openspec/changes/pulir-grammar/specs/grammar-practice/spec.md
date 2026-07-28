# Grammar Practice Specification

## Purpose

Define la práctica adaptativa de Grammar en sesiones breves, con programación
SREM, dos formatos TOEFL ITP, progreso por habilidad y soporte offline.

## Requirements

### Requirement: Target construct

The system MUST identify the module as practice for TOEFL ITP Structure and
Written Expression and MUST NOT present its internal progress as an official
TOEFL or CEFR score.

#### Scenario: User views Grammar progress

- GIVEN the user has completed Grammar exercises
- WHEN the progress summary is rendered
- THEN the system MUST show Macitta learning metrics
- AND the system MUST NOT show a converted TOEFL section score
- AND the system MUST NOT claim official ETS affiliation

### Requirement: Supported exercise formats

The system MUST support sentence completion and error identification as distinct
validated exercise formats.

#### Scenario: Sentence completion

- GIVEN a published sentence completion exercise
- WHEN it is rendered
- THEN the system MUST display one incomplete sentence
- AND the system MUST display exactly four options
- AND exactly one option MUST complete the sentence correctly

#### Scenario: Error identification

- GIVEN a published error identification exercise
- WHEN it is rendered
- THEN the system MUST display one sentence
- AND the system MUST expose exactly four selectable segments
- AND exactly one segment MUST require a change
- AND the segments MUST be keyboard accessible

### Requirement: Five-exercise sessions

The default Grammar session MUST contain up to five eligible exercises.

#### Scenario: At least five exercises are eligible

- GIVEN at least five exercises are eligible
- WHEN the user starts the daily review
- THEN the session MUST contain exactly five exercises
- AND the session SHOULD approximate two sentence completion exercises and
  three error identification exercises
- AND the session MUST prioritize overdue work over new work

#### Scenario: Fewer than five exercises are eligible

- GIVEN fewer than five exercises are eligible
- WHEN the user starts the daily review
- THEN the session MUST contain every eligible exercise
- AND the UI MUST NOT represent the shorter session as an error

### Requirement: Adaptive selection

The system MUST prioritize due and weak exercises while preserving useful
variety.

#### Scenario: User has an overdue backlog

- GIVEN the user has at least five overdue exercises
- WHEN a session is built
- THEN the system MUST select from overdue exercises before adding new ones
- AND older due dates MUST receive higher priority
- AND lapses and difficulty MUST break ties

#### Scenario: User has room for new content

- GIVEN the user has fewer than five overdue exercises
- WHEN a session is built
- THEN the system MAY fill every remaining slot with new exercises
- AND a new user SHOULD receive five exercises when enough content exists
- AND new exercises SHOULD come from skills with low coverage

#### Scenario: Diversity is possible

- GIVEN multiple eligible domains and formats exist
- WHEN a general session is built
- THEN no more than two exercises SHOULD come from one domain
- AND identical microhabilidades SHOULD NOT appear consecutively

### Requirement: Grammar SREM adapter

The system MUST use the shared SREM transition rules with a Grammar-specific
grading adapter.

#### Scenario: First-attempt correct answer

- GIVEN an exercise with a current SREM state
- WHEN the user answers correctly before seeing feedback
- THEN the review MUST be graded `Good`
- AND response time MUST be logged
- AND response time MUST NOT lower the grade in V1

#### Scenario: Incorrect answer

- GIVEN an exercise with a current SREM state
- WHEN the user answers incorrectly
- THEN the review MUST be graded `Again`
- AND a later correction after feedback MUST NOT advance SREM

### Requirement: Completion and mastery

The system MUST distinguish completion from long-term mastery.

#### Scenario: Two spaced successful reviews

- GIVEN a new exercise
- WHEN the user answers it correctly on two eligible reviews in separate sessions
- THEN the exercise MUST reach at least SREM step 2
- AND it MUST appear in the completed area
- AND it MUST retain a future due date

#### Scenario: Same-session retry

- GIVEN the user answered an exercise incorrectly
- WHEN the user selects the correct answer after feedback in the same session
- THEN the system MUST NOT count that correction as another review
- AND the exercise MUST NOT advance to completed because of the retry

#### Scenario: Completed exercise becomes due

- GIVEN a completed exercise reaches its future due date
- WHEN the next session is built
- THEN the exercise MAY reappear as maintenance
- AND the UI MUST preserve its previous completion history

### Requirement: Immediate corrective feedback

The system MUST provide feedback after every answer.

#### Scenario: Incorrect selection

- GIVEN the user selects an incorrect option or segment
- WHEN the answer is submitted
- THEN the system MUST identify the correct choice
- AND it MUST display the corrected sentence
- AND it MUST explain the governing rule
- AND it SHOULD explain the misconception represented by the selected distractor

### Requirement: Skill taxonomy

Every published exercise MUST have one primary grammar skill and MAY have
secondary skills.

#### Scenario: Publishing content

- GIVEN a draft exercise
- WHEN it is validated for publication
- THEN its primary skill MUST reference an active catalog skill
- AND its CEFR band and difficulty MUST be valid
- AND its format-specific payload MUST pass validation

### Requirement: Content quality

No exercise MAY be published without structural and human review.

#### Scenario: Automated validation fails

- GIVEN a draft has duplicate options, multiple valid answers, invalid segments,
  or missing explanation
- WHEN the content pipeline runs
- THEN publication MUST fail

#### Scenario: Human review is incomplete

- GIVEN a draft passes schema validation
- WHEN linguistic and fairness reviews are incomplete
- THEN its status MUST remain non-published

### Requirement: Offline-first review

Grammar practice MUST remain usable after content has been cached and the
network is unavailable.

#### Scenario: User completes a session offline

- GIVEN Grammar content and progress are cached
- AND the device is offline
- WHEN the user completes an exercise
- THEN the attempt MUST be stored locally with a stable UUID
- AND progress MUST update locally
- AND sync operations MUST be queued

#### Scenario: Connection returns

- GIVEN queued Grammar attempts exist
- WHEN connectivity returns
- THEN each attempt MUST be inserted idempotently
- AND duplicate retries MUST NOT create duplicate attempts

### Requirement: User data isolation

Grammar progress, sessions and attempts MUST be isolated by authenticated user.

#### Scenario: User requests another user's progress

- GIVEN an authenticated user requests a row owned by another user
- WHEN Supabase evaluates RLS
- THEN the operation MUST return no protected row
- AND the user MUST NOT be able to insert or update a row using another user ID

### Requirement: Content retirement

Invalid or obsolete content MUST be removable from future practice without
destroying history.

#### Scenario: Published exercise is retired

- GIVEN a published exercise has attempts
- WHEN it is marked retired
- THEN it MUST NOT appear in new sessions
- AND existing attempts MUST remain queryable by their owner
- AND historical content version MUST remain identifiable
