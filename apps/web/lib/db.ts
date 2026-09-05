import Dexie, { type Table } from 'dexie';
import type {
    SremInboxItem,
    TOEFLAttempt,
    TOEFLExam,
    TOEFLQuestion,
    TOEFLQuestionAnswer,
} from '@/types/models';
import type {
    GrammarDomain,
    GrammarExercise,
    GrammarProgress,
    GrammarSkill,
    GrammarOptionId,
    ReadingDomain,
    ReadingOptionId,
    ReadingPassage,
    ReadingPassageExposure,
    ReadingQuestion,
    ReadingQuestionProgress,
    ReadingSkill,
    ReadingSkillProgress,
    ListeningOptionId,
    ListeningQuestionProgress,
    ListeningSkillProgress,
} from '@macitta/shared';

// ─── Interfaces ─────────────────────────────────────────────────────

export interface LocalCard {
    id: string;
    deck_id: string;
    front_text: string;
    front_media?: string | null;
    slots: any[]; // Complex json types
    updated_at: string;
}

export interface LocalUserItem {
    user_id: string;
    card_id: string;
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: string;
    last_review: string | null;
    due_date: string;
}

export interface LocalStudyLog {
    id?: string;
    user_id: string;
    card_id: string;
    session_id: string | null;
    grade: number;
    time_taken_ms: number;
    accuracy: number;
    review_date: string;
}

export type LocalTOEFLExam = TOEFLExam;
export type LocalTOEFLQuestion = TOEFLQuestion;
export type LocalTOEFLAttempt = TOEFLAttempt;
export type LocalTOEFLQuestionAnswer = TOEFLQuestionAnswer;
export type LocalSremInboxItem = SremInboxItem;
export type LocalGrammarDomain = GrammarDomain;
export type LocalGrammarSkill = GrammarSkill;
export type LocalGrammarExercise = GrammarExercise;
export type LocalGrammarProgress = GrammarProgress;
export type LocalReadingDomain = ReadingDomain;
export type LocalReadingSkill = ReadingSkill;
export type LocalReadingPassage = ReadingPassage;
export type LocalReadingQuestion = ReadingQuestion;
export type LocalReadingQuestionProgress = ReadingQuestionProgress;
export type LocalReadingSkillProgress = ReadingSkillProgress;
export type LocalReadingPassageExposure = ReadingPassageExposure;
export type LocalListeningQuestionProgress = ListeningQuestionProgress;
export type LocalListeningSkillProgress = ListeningSkillProgress;

export interface LocalGrammarSession {
    id: string;
    userId: string;
    mode: 'general' | 'focused';
    focusedSkillId: string | null;
    status: 'active' | 'completed' | 'abandoned';
    startedAt: string;
    endedAt: string | null;
    totalExercises: number;
    correctExercises: number;
    totalTimeMs: number;
}

export interface LocalGrammarAttempt {
    id: string;
    userId: string;
    exerciseId: string;
    sessionId: string;
    selectedOptionId: GrammarOptionId;
    isCorrect: boolean;
    grade: number;
    previousState: {
        step: number;
        interval: number;
        difficulty: number;
        lapses: number;
        state: string;
        lastReview: string | null;
        dueDate: string;
    };
    nextState: {
        step: number;
        interval: number;
        difficulty: number;
        lapses: number;
        state: string;
        lastReview: string | null;
        dueDate: string;
    };
    responseMs: number;
    wasDue: boolean;
    contentVersion: number;
    reviewedAt: string;
}

export interface LocalReadingSession {
    id: string;
    userId: string;
    mode: 'daily' | 'long' | 'recovery' | 'continued';
    primaryPassageId: string | null;
    status: 'active' | 'completed' | 'abandoned';
    startedAt: string;
    endedAt: string | null;
    totalQuestions: number;
    correctQuestions: number;
    totalTimeMs: number;
}

export interface LocalReadingAttempt {
    id: string;
    userId: string;
    questionId: string;
    sessionId: string;
    selectedOptionId: ReadingOptionId;
    isCorrect: boolean;
    grade: number;
    previousQuestionState: {
        points: number;
        attempts: number;
        correctAttempts: number;
        lastAnsweredAt: string | null;
        dueAt: string;
    };
    nextQuestionState: {
        points: number;
        attempts: number;
        correctAttempts: number;
        lastAnsweredAt: string | null;
        dueAt: string;
    };
    previousSkillState: {
        step: number;
        interval: number;
        difficulty: number;
        lapses: number;
        state: string;
        lastReview: string | null;
        dueDate: string;
    };
    nextSkillState: {
        step: number;
        interval: number;
        difficulty: number;
        lapses: number;
        state: string;
        lastReview: string | null;
        dueDate: string;
    };
    responseMs: number;
    contentVersion: number;
    answeredAt: string;
}

export interface LocalListeningSession {
    id: string;
    userId: string;
    mode: 'quick' | 'long';
    primaryUnitId: string | null;
    status: 'active' | 'completed' | 'abandoned';
    startedAt: string;
    endedAt: string | null;
    totalQuestions: number;
    correctQuestions: number;
    totalTimeMs: number;
}

export interface LocalListeningAttempt {
    id: string;
    userId: string;
    questionId: string;
    sessionId: string;
    selectedOptionId: ListeningOptionId;
    isCorrect: boolean;
    earnedPoints: 0 | 1 | 2;
    playCount: number;
    previousQuestionState: Omit<ListeningQuestionProgress, 'userId' | 'questionId' | 'revision'>;
    nextQuestionState: Omit<ListeningQuestionProgress, 'userId' | 'questionId' | 'revision'>;
    previousSkillState: Omit<ListeningSkillProgress, 'userId' | 'skillCode' | 'revision' | 'correctAttempts' | 'totalAttempts'>;
    nextSkillState: Omit<ListeningSkillProgress, 'userId' | 'skillCode' | 'revision' | 'correctAttempts' | 'totalAttempts'>;
    responseMs: number;
    answeredAt: string;
}

// ─── Sync Operations (Discriminated Union) ──────────────────────────

interface UpsertUserItemOp {
    id?: number;
    type: 'upsert_user_item';
    data: Omit<LocalUserItem, never>;
    created_at: string;
    retryCount?: number;
}

interface InsertStudyLogOp {
    id?: number;
    type: 'insert_study_log';
    data: {
        user_id: string;
        card_id: string;
        session_id: string | null;
        grade: number;
        time_taken_ms: number;
        accuracy: number;
        review_date: string;
    };
    created_at: string;
    retryCount?: number;
}

interface SessionOp {
    id?: number;
    type: 'start_session' | 'end_session';
    data: {
        session_id: string;
        user_id: string;
        deck_id?: string | null;
        started_at?: string;
        ended_at?: string;
        total_cards?: number;
        correct_cards?: number;
        total_time_ms?: number;
    };
    created_at: string;
    retryCount?: number;
}

interface IncrementSessionTimeOp {
    id?: number;
    type: 'increment_session_time';
    data: {
        session_id: string;
        time_ms: number;
    };
    created_at: string;
    retryCount?: number;
}

interface InsertTOEFLAttemptOp {
    id?: number;
    type: 'insert_toefl_attempt';
    data: LocalTOEFLAttempt;
    created_at: string;
    retryCount?: number;
}

interface InsertTOEFLAnswersOp {
    id?: number;
    type: 'insert_toefl_answers';
    data: LocalTOEFLQuestionAnswer[];
    created_at: string;
    retryCount?: number;
}

interface GrammarSessionOp {
    id?: number;
    type: 'start_grammar_session' | 'finish_grammar_session';
    data: LocalGrammarSession;
    created_at: string;
    retryCount?: number;
}

interface InsertGrammarAttemptOp {
    id?: number;
    type: 'insert_grammar_attempt';
    data: LocalGrammarAttempt;
    created_at: string;
    retryCount?: number;
}

interface UpsertGrammarProgressOp {
    id?: number;
    type: 'upsert_grammar_progress';
    data: LocalGrammarProgress & { expectedRevision: number };
    created_at: string;
    retryCount?: number;
}

interface ReadingSessionOp {
    id?: number;
    type: 'start_reading_session' | 'finish_reading_session';
    data: LocalReadingSession;
    created_at: string;
    retryCount?: number;
}

interface InsertReadingAttemptOp {
    id?: number;
    type: 'insert_reading_attempt';
    data: LocalReadingAttempt;
    created_at: string;
    retryCount?: number;
}

interface UpsertReadingQuestionProgressOp {
    id?: number;
    type: 'upsert_reading_question_progress';
    data: LocalReadingQuestionProgress & { expectedRevision: number };
    created_at: string;
    retryCount?: number;
}

interface UpsertReadingSkillProgressOp {
    id?: number;
    type: 'upsert_reading_skill_progress';
    data: LocalReadingSkillProgress & { expectedRevision: number };
    created_at: string;
    retryCount?: number;
}

interface RecordReadingExposureOp {
    id?: number;
    type: 'record_reading_exposure';
    data: LocalReadingPassageExposure;
    created_at: string;
    retryCount?: number;
}

interface ListeningSessionOp {
    id?: number;
    type: 'start_listening_session' | 'finish_listening_session';
    data: LocalListeningSession;
    created_at: string;
    retryCount?: number;
}

interface InsertListeningAttemptOp {
    id?: number;
    type: 'insert_listening_attempt';
    data: LocalListeningAttempt;
    created_at: string;
    retryCount?: number;
}

interface UpsertListeningQuestionProgressOp {
    id?: number;
    type: 'upsert_listening_question_progress';
    data: LocalListeningQuestionProgress & { expectedRevision: number };
    created_at: string;
    retryCount?: number;
}

interface UpsertListeningSkillProgressOp {
    id?: number;
    type: 'upsert_listening_skill_progress';
    data: LocalListeningSkillProgress & { expectedRevision: number };
    created_at: string;
    retryCount?: number;
}

export type SyncOperation =
    | UpsertUserItemOp
    | InsertStudyLogOp
    | SessionOp
    | IncrementSessionTimeOp
    | InsertTOEFLAttemptOp
    | InsertTOEFLAnswersOp
    | GrammarSessionOp
    | InsertGrammarAttemptOp
    | UpsertGrammarProgressOp
    | ReadingSessionOp
    | InsertReadingAttemptOp
    | UpsertReadingQuestionProgressOp
    | UpsertReadingSkillProgressOp
    | RecordReadingExposureOp
    | ListeningSessionOp
    | InsertListeningAttemptOp
    | UpsertListeningQuestionProgressOp
    | UpsertListeningSkillProgressOp;

// ─── Database ───────────────────────────────────────────────────────

export class MaccitaDB extends Dexie {
    cards!: Table<LocalCard>;
    userItems!: Table<LocalUserItem>;
    studyLogs!: Table<LocalStudyLog>;
    syncQueue!: Table<SyncOperation>;
    toeflExams!: Table<LocalTOEFLExam>;
    toeflQuestions!: Table<LocalTOEFLQuestion>;
    toeflAttempts!: Table<LocalTOEFLAttempt>;
    toeflAnswers!: Table<LocalTOEFLQuestionAnswer>;
    sremInbox!: Table<LocalSremInboxItem>;
    grammarDomains!: Table<LocalGrammarDomain>;
    grammarSkills!: Table<LocalGrammarSkill>;
    grammarExercises!: Table<LocalGrammarExercise>;
    grammarProgress!: Table<LocalGrammarProgress>;
    grammarSessions!: Table<LocalGrammarSession>;
    grammarAttempts!: Table<LocalGrammarAttempt>;
    readingDomains!: Table<LocalReadingDomain>;
    readingSkills!: Table<LocalReadingSkill>;
    readingPassages!: Table<LocalReadingPassage>;
    readingQuestions!: Table<LocalReadingQuestion>;
    readingQuestionProgress!: Table<LocalReadingQuestionProgress>;
    readingSkillProgress!: Table<LocalReadingSkillProgress>;
    readingPassageExposures!: Table<LocalReadingPassageExposure>;
    readingSessions!: Table<LocalReadingSession>;
    readingAttempts!: Table<LocalReadingAttempt>;
    listeningQuestionProgress!: Table<LocalListeningQuestionProgress>;
    listeningSkillProgress!: Table<LocalListeningSkillProgress>;
    listeningSessions!: Table<LocalListeningSession>;
    listeningAttempts!: Table<LocalListeningAttempt>;

    constructor() {
        super('MaccitaOfflineV1');
        this.version(1).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at'
        });

        this.version(2).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at',
            toeflExams: 'id, section, type',
            toeflQuestions: 'id, exam_id, [exam_id+order_index]',
            toeflAttempts: 'id, user_id, exam_id, completed_at',
            toeflAnswers: '[attempt_id+question_id], attempt_id, question_id',
            sremInbox: 'id, user_id, created_at'
        });

        this.version(3).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at',
            toeflExams: 'id, section, type',
            toeflQuestions: 'id, exam_id, [exam_id+order_index]',
            toeflAttempts: 'id, user_id, exam_id, completed_at',
            toeflAnswers: '[attempt_id+question_id], attempt_id, question_id',
            sremInbox: 'id, user_id, created_at',
            grammarDomains: 'id, code, order_index',
            grammarSkills: 'id, domain_id, code, [domain_id+order_index]',
            grammarExercises: 'id, primary_skill_id, domain_id, skill_code, format, status',
            grammarProgress: '[userId+exerciseId], userId, exerciseId, dueDate, [userId+dueDate]',
            grammarSessions: 'id, userId, status, startedAt',
            grammarAttempts: 'id, userId, exerciseId, sessionId, reviewedAt',
        });

        this.version(4).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at',
            toeflExams: 'id, section, type',
            toeflQuestions: 'id, exam_id, [exam_id+order_index]',
            toeflAttempts: 'id, user_id, exam_id, completed_at',
            toeflAnswers: '[attempt_id+question_id], attempt_id, question_id',
            sremInbox: 'id, user_id, created_at',
            grammarDomains: 'id, code, order_index',
            grammarSkills: 'id, domain_id, code, [domain_id+order_index]',
            grammarExercises: 'id, primary_skill_id, domain_id, skill_code, format, status',
            grammarProgress: '[userId+exerciseId], userId, exerciseId, dueDate, [userId+dueDate]',
            grammarSessions: 'id, userId, status, startedAt',
            grammarAttempts: 'id, userId, exerciseId, sessionId, reviewedAt',
            readingDomains: 'id, code, order_index',
            readingSkills: 'id, domain_id, code, [domain_id+order_index]',
            readingPassages: 'id, slug, genre, length_band, status',
            readingQuestions: 'id, passage_id, primary_skill_id, skill_code, [passage_id+block_index], [passage_id+order_index], status',
            readingQuestionProgress: '[userId+questionId], userId, questionId, dueAt, [userId+dueAt], points',
            readingSkillProgress: '[userId+skillId], userId, skillId, dueDate, [userId+dueDate]',
            readingPassageExposures: '[userId+passageId], userId, passageId, lastSeenAt, [userId+lastSeenAt]',
            readingSessions: 'id, userId, status, startedAt, primaryPassageId',
            readingAttempts: 'id, userId, questionId, sessionId, answeredAt',
        });

        this.version(5).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at',
            toeflExams: 'id, section, type',
            toeflQuestions: 'id, exam_id, [exam_id+order_index]',
            toeflAttempts: 'id, user_id, exam_id, completed_at',
            toeflAnswers: '[attempt_id+question_id], attempt_id, question_id',
            sremInbox: 'id, user_id, created_at',
            grammarDomains: 'id, code, order_index',
            grammarSkills: 'id, domain_id, code, [domain_id+order_index]',
            grammarExercises: 'id, primary_skill_id, domain_id, skill_code, format, status',
            grammarProgress: '[userId+exerciseId], userId, exerciseId, dueDate, [userId+dueDate]',
            grammarSessions: 'id, userId, status, startedAt',
            grammarAttempts: 'id, userId, exerciseId, sessionId, reviewedAt',
            readingDomains: 'id, code, order_index',
            readingSkills: 'id, domain_id, code, [domain_id+order_index]',
            readingPassages: 'id, slug, genre, length_band, status',
            readingQuestions: 'id, passage_id, primary_skill_id, skill_code, [passage_id+block_index], [passage_id+order_index], status',
            readingQuestionProgress: '[userId+questionId], userId, questionId, dueAt, [userId+dueAt], points',
            readingSkillProgress: '[userId+skillId], userId, skillId, dueDate, [userId+dueDate]',
            readingPassageExposures: '[userId+passageId], userId, passageId, lastSeenAt, [userId+lastSeenAt]',
            readingSessions: 'id, userId, status, startedAt, primaryPassageId',
            readingAttempts: 'id, userId, questionId, sessionId, answeredAt',
            listeningQuestionProgress: '[userId+questionId], userId, questionId, dueAt, [userId+dueAt], points',
            listeningSkillProgress: '[userId+skillCode], userId, skillCode, dueDate, [userId+dueDate]',
            listeningSessions: 'id, userId, status, startedAt, primaryUnitId',
            listeningAttempts: 'id, userId, questionId, sessionId, answeredAt',
        });
    }
}

export const db = new MaccitaDB();

/**
 * Remove all account-scoped data before ending a session.
 *
 * Static TOEFL and grammar catalogs may remain available offline, but user
 * answers, progress, queues and personal cards must never cross accounts on a
 * shared browser profile.
 */
export async function clearPrivateOfflineData(): Promise<void> {
    await db.transaction(
        'rw',
        [
            db.cards,
            db.userItems,
            db.studyLogs,
            db.syncQueue,
            db.toeflAttempts,
            db.toeflAnswers,
            db.sremInbox,
            db.grammarProgress,
            db.grammarSessions,
            db.grammarAttempts,
            db.readingQuestionProgress,
            db.readingSkillProgress,
            db.readingPassageExposures,
            db.readingSessions,
            db.readingAttempts,
            db.listeningQuestionProgress,
            db.listeningSkillProgress,
            db.listeningSessions,
            db.listeningAttempts,
        ],
        async () => {
            await Promise.all([
                db.cards.clear(),
                db.userItems.clear(),
                db.studyLogs.clear(),
                db.syncQueue.clear(),
                db.toeflAttempts.clear(),
                db.toeflAnswers.clear(),
                db.sremInbox.clear(),
                db.grammarProgress.clear(),
                db.grammarSessions.clear(),
                db.grammarAttempts.clear(),
                db.readingQuestionProgress.clear(),
                db.readingSkillProgress.clear(),
                db.readingPassageExposures.clear(),
                db.readingSessions.clear(),
                db.readingAttempts.clear(),
                db.listeningQuestionProgress.clear(),
                db.listeningSkillProgress.clear(),
                db.listeningSessions.clear(),
                db.listeningAttempts.clear(),
            ]);
        },
    );
}
