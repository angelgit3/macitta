import React from "react";
import { Brain, Clock, CheckCircle2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type SEMState = 'mastered' | 'review' | 'learning' | 'relearning' | 'new';

interface VerbUserItem {
    state: string;
    stability: number;
    difficulty: number;
    due_date: string;
}

interface VerbCardProps {
    id: string;
    question: string;
    userItem?: VerbUserItem | null;
}

// ─── Status Helpers ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<SEMState, { color: string; icon: React.ReactNode | null; label: string }> = {
    mastered: {
        color: 'text-yellow-400 bg-yellow-400/10',
        icon: <CheckCircle2 size={12} />,
        label: 'Dominado 🏆',
    },
    review: {
        color: 'text-green-400 bg-green-400/10',
        icon: <CheckCircle2 size={12} />,
        label: 'Repaso',
    },
    learning: {
        color: 'text-blue-400 bg-blue-400/10',
        icon: <Brain size={12} />,
        label: 'Aprendiendo',
    },
    relearning: {
        color: 'text-orange-400 bg-orange-400/10',
        icon: <Clock size={12} />,
        label: 'Re-aprendiendo',
    },
    new: {
        color: 'text-zinc-500 bg-zinc-500/10',
        icon: null,
        label: 'Nuevo',
    },
};

// ─── Component ──────────────────────────────────────────────────────

export function VerbCard({ id, question, userItem }: VerbCardProps) {
    const state = (userItem?.state || 'new') as SEMState;
    const config = STATUS_CONFIG[state] ?? STATUS_CONFIG.new;

    const formattedDueDate = userItem?.due_date
        ? new Date(userItem.due_date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
        })
        : '--';

    return (
        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-colors">
            <div className="flex flex-col gap-0.5">
                <span className="text-lg font-bold text-white capitalize">{question}</span>
                <div className="flex items-center gap-2">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}
                    >
                        {config.icon}
                        {config.label}
                    </span>
                    {userItem?.difficulty && (
                        <span className="text-[10px] text-zinc-600 font-medium">
                            Dif: {Math.round(userItem.difficulty * 10) / 10}
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">
                    Próximo repaso
                </span>
                <span className="text-xs font-bold text-zinc-300">{formattedDueDate}</span>
            </div>
        </div>
    );
}
