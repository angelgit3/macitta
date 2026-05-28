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
