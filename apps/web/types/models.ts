/**
 * Core Database Models
 * Centralized interfaces representing our Supabase database schema.
 * Using these prevents redefining types across different UI components.
 */

export interface Deck {
    id: string;
    title: string;
    description: string | null;
    author_id: string;
    created_at: string;
    answer_labels?: string[];
    question_labels?: string[];
    color?: string | null;
}

export interface CardSlot {
    id: string;
    card_id?: string;
    label: string;
    accepted_answers: string[];
    match_type?: 'any' | 'all' | 'exact' | 'advanced' | string;
    advanced_rules?: unknown;
    media?: string | null;
    order_index?: number;
}

export interface Card {
    id: string;
    deck_id?: string;
    front_text: string;
    front_media?: string | null;
    created_at: string;
    card_slots: CardSlot[];
    user_items?: { due_date: string }[];
}

export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    created_at?: string;
}

export type TOEFLSection = 'reading' | 'listening' | 'grammar';
export type TOEFLMode = 'strict' | 'flexible';

export interface TOEFLAnswerOption {
    id: string;
    text: string;
}

export interface TOEFLExam {
    id: string;
    title: string;
    section: TOEFLSection;
    type: string;
    passage_text: string | null;
    audio_path: string | null;
    transcript: string | null;
    scale_mapping: Record<string, number>;
    created_at: string;
}

export interface TOEFLQuestion {
    id: string;
    exam_id: string;
    question_text: string;
    options: TOEFLAnswerOption[];
    correct_option_id: string;
    order_index: number;
    points_weight: number;
    explanation: string;
    created_at: string;
}

export interface TOEFLAttempt {
    id: string;
    user_id: string;
    exam_id: string;
    raw_score: number;
    scaled_score: number;
    time_taken: number;
    mode: TOEFLMode;
    completed_at: string;
}

export interface TOEFLQuestionAnswer {
    attempt_id: string;
    question_id: string;
    user_choice: string | null;
    is_correct: boolean;
}

export interface SremInboxItem {
    id: string;
    user_id: string;
    word: string;
    context: string;
    created_at: string;
}
