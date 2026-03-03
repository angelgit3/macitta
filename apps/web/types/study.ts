import type { SEMCardState } from "@maccita/shared";
import type { SEMGrade } from "@maccita/shared";

// ─── Card Domain ─────────────────────────────────────────────────────

export interface Slot {
    id: string;
    label: string;
    accepted_answers: string[];
    match_type: 'any' | 'all';
    order_index: number;
}

export interface CardData {
    id: string;
    question: string;
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
