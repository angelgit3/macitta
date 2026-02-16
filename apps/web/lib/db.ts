import Dexie, { type Table } from 'dexie';

export interface LocalCard {
    id: string;
    deck_id: string;
    question: string;
    slots: any[];
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

export interface SyncOperation {
    id?: number;
    type: 'upsert_user_item' | 'insert_study_log' | 'increment_session_time' | 'start_session' | 'end_session';
    data: any;
    created_at: string;
}

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
