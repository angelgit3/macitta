import type { SEMCardState } from "@macitta/shared";
import type { SEMGrade } from "@macitta/shared";

// ─── Card Domain ─────────────────────────────────────────────────────

export interface Slot {
    id: string;
    label: string;
    accepted_answers: string[];
    match_type: 'any' | 'all' | 'exact' | 'advanced';
    order_index: number;
    advanced_rules?: any;
    media?: string | null;
}

export interface CardData {
    id: string;
    front_text: string;
    slots: Slot[];
    sem: SEMCardState;
}

// ─── Interaction State ───────────────────────────────────────────────

export interface SlotFeedback {
    status: 'correct' | 'incorrect' | 'neutral';
    message?: string;
}

export interface SessionStats {
    correct: number;
    total: number;
    durationMs: number;
}

// ─── Re-exports for convenience ─────────────────────────────────────

export type { SEMCardState, SEMGrade };
