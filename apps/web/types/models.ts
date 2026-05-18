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
    advanced_rules?: any;
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
}

export interface AssignedDeck {
    id: string;
    deck_id: string;
    classroom_id: string;
    assigned_by: string;
    assigned_at: string;
    decks: Deck; // When joined
}

export interface Classroom {
    id: string;
    name: string;
    join_code: string;
    teacher_id?: string;
    created_at?: string;
}

export interface Profile {
    id: string;
    role: 'teacher' | 'student' | string;
    email?: string;
    full_name?: string;
    created_at?: string;
}
