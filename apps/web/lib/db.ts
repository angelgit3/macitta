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
} from '@macitta/shared';

// ─── Interfaces ─────────────────────────────────────────────────────

export interface LocalCard {
    id: string;
    deck_id: string;
    front_text: string;
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

export type SyncOperation =
    | UpsertUserItemOp
    | InsertStudyLogOp
    | SessionOp
    | IncrementSessionTimeOp
    | InsertTOEFLAttemptOp
    | InsertTOEFLAnswersOp
    | GrammarSessionOp
    | InsertGrammarAttemptOp
    | UpsertGrammarProgressOp;

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
    }
}

export const db = new MaccitaDB();
