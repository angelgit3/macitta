/**
 * Macitta — Shared Data Model Types
 * Mirrors the Supabase public schema for type-safe client code.
 */

// ─── Content (Static) ───────────────────────────────────────────────

export interface Deck {
    id: string;
    author_id: string | null;
    title: string;
    description: string | null;
    color: string | null;
    question_labels: string[];
    answer_labels: string[];
    created_at: string;
}

export interface CardRow {
    id: string;
    deck_id: string;
    front_text: string;
    front_media: { image?: string; audio?: string } | null;
    created_at: string;
}

export interface CardSlot {
    id: string;
    card_id: string;
    label: string;
    accepted_answers: string[];
    match_type: 'any' | 'all';
    order_index: number;
    advanced_rules: unknown | null; // ComplexAnswer JSON equivalent
    media: { image?: string; audio?: string } | null;
}

// ─── User Progress (Dynamic) ────────────────────────────────────────

export interface UserItem {
    id: string;
    user_id: string;
    card_id: string;
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
    state: 'new' | 'learning' | 'review' | 'mastered';
    last_review: string | null;
    due_date: string;
}

// ─── Study Tracking ─────────────────────────────────────────────────

export interface StudyLog {
    id: string;
    user_id: string;
    card_id: string;
    session_id: string | null;
    grade: number;
    time_taken_ms: number;
    accuracy: number;
    review_date: string;
}

export interface StudySession {
    id: string;
    user_id: string;
    deck_id: string;
    started_at: string;
    ended_at: string | null;
    total_cards: number;
    correct_cards: number;
    total_time_ms: number;
    created_at: string;
}
