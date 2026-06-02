import React from "react";
import { Brain, Clock, CheckCircle2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type SEMState = "mastered" | "review" | "learning" | "relearning" | "new";

interface VerbUserItem {
    state: string;
    stability: number;
    difficulty: number;
    due_date: string;
}

interface VerbCardProps {
    id: string;
    front_text: string;
    userItem?: VerbUserItem | null;
}

// ─── Status config ──────────────────────────────────────────────────

/** Visual metadata for each SEM (Spaced Enhanced Memory) state. */
const STATUS_CONFIG: Record<SEMState, { color: string; icon: React.ReactNode | null; label: string }> = {
    mastered:   { color: "text-ink-muted bg-ink-muted/10",  icon: <CheckCircle2 size={12} />, label: "Dominado 🏆"       },
    review:     { color: "text-success bg-success/10",      icon: <CheckCircle2 size={12} />, label: "Repaso"             },
    learning:   { color: "text-accent bg-accent/10",        icon: <Brain size={12} />,        label: "Aprendiendo"        },
    relearning: { color: "text-amber bg-amber/10",          icon: <Clock size={12} />,        label: "Re-aprendiendo"     },
    new:        { color: "text-ink-faint bg-ink-faint/10",  icon: null,                       label: "Nuevo"              },
};

// ─── Component ──────────────────────────────────────────────────────

/**
 * VerbCard — compact list item showing a vocabulary card's front text,
 * SEM state badge, difficulty, and next review date.
 */
export function VerbCard({ id: _id, front_text, userItem }: VerbCardProps) {
    const state  = (userItem?.state || "new") as SEMState;
    const config = STATUS_CONFIG[state] ?? STATUS_CONFIG.new;

    const formattedDueDate = userItem?.due_date
        ? new Date(userItem.due_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        : "--";

    return (
        <div className="bg-surface border border-border rounded-2xl p-4 flex justify-between items-center hover:border-ink/10 transition-colors">
            <div className="flex flex-col gap-0.5">
                <span className="text-lg font-bold text-ink capitalize">{front_text}</span>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </span>
                    {userItem?.difficulty && (
                        <span className="text-[10px] text-ink-faint font-medium">
                            Dif: {Math.round(userItem.difficulty * 10) / 10}
                        </span>
                    )}
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
                <span className="label-kicker">Próximo repaso</span>
                <span className="text-xs font-bold text-ink-muted">{formattedDueDate}</span>
            </div>
        </div>
    );
}
