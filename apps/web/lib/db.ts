import Dexie, { type Table } from 'dexie';
import type { Slot } from '@/types/study';

// ─── Interfaces ─────────────────────────────────────────────────────

export interface LocalCard {
    id: string;
    deck_id: string;
    question: string;
    slots: Slot[];
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
        deck_id?: string;
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

export type SyncOperation =
    | UpsertUserItemOp
    | InsertStudyLogOp
    | SessionOp
    | IncrementSessionTimeOp;

// ─── Database ───────────────────────────────────────────────────────

export class MaccitaDB extends Dexie {
    cards!: Table<LocalCard>;
    userItems!: Table<LocalUserItem>;
    studyLogs!: Table<LocalStudyLog>;
    syncQueue!: Table<SyncOperation>;

    constructor() {
        super('MaccitaOfflineV1');
        this.version(1).stores({
            cards: 'id, deck_id',
            userItems: '[user_id+card_id], card_id, due_date',
            studyLogs: '++id, user_id, card_id, session_id',
            syncQueue: '++id, type, created_at'
        });
    }
}

export const db = new MaccitaDB();
