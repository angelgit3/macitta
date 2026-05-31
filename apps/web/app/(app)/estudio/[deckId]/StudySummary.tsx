import { Zap, Clock, Target, CheckCircle, Flame } from "lucide-react";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";
import type { ReactNode } from "react";

interface StudySummaryProps {
    totalCards: number;
    correctCards: number;
    totalTimeMs: number;
    isRushMode?: boolean;
    remainingDueCount?: number | null;
    onStartRushMode?: () => void;
}

/** Format milliseconds into a human-readable "Xmin" / "Xs" string. */
function formatMs(ms: number): string {
    if (ms > 60_000) return `${(ms / 60_000).toFixed(1)} min`;
    return `${(ms / 1_000).toFixed(0)} seg`;
}

/**
 * StudySummary — shown when a study session or rush-mode round finishes.
 * Displays accuracy, time, and optional next-step actions.
 */
export function StudySummary({
    totalCards,
    correctCards,
    totalTimeMs,
    isRushMode = false,
    remainingDueCount,
    onStartRushMode,
}: StudySummaryProps) {
    const accuracy    = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;
    const canStartRush = !isRushMode && remainingDueCount === 0;

    /** Shared class for the marathon CTA buttons */
    const rushBtnClass =
        "w-full flex items-center justify-center gap-2 py-3 rounded-xl " +
        "border border-amber/40 bg-amber/10 text-amber " +
        "hover:bg-amber/20 font-bold text-sm uppercase tracking-wide " +
        "transition-all duration-200 active:scale-[0.97]";

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-700">

            {/* ── Result card ──────────────────────────────── */}
            <div className="glass-panel rounded-2xl p-8 w-full relative overflow-hidden">
                {/* top accent hairline */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />

                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-accent/10 border border-accent/20">
                    {isRushMode
                        ? <Flame    className="w-10 h-10 text-amber" />
                        : <CheckCircle className="w-10 h-10 text-accent" />
                    }
                </div>

                <div className="space-y-2 mt-6">
                    <h1 className="text-4xl font-black text-ink">
                        {isRushMode ? "Maratón completo" : "Misión cumplida"}
                    </h1>
                    <p className="readable-copy">
                        {isRushMode
                            ? "Has reforzado tu memoria extra hoy."
                            : "Has fortalecido tu memoria hoy."}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full mt-7">
                    <SummaryMetric icon={<Target size={18} />} value={totalCards}            label="Vistos"   />
                    <SummaryMetric icon={<Zap    size={18} />} value={`${accuracy}%`}        label="Puntería" />
                    <SummaryMetric icon={<Clock  size={18} />} value={formatMs(totalTimeMs)} label="Tiempo"   />
                </div>
            </div>

            {/* ── Actions ──────────────────────────────────── */}
            <div className="flex flex-col gap-3 w-full">
                <Link href="/dashboard" className="w-full">
                    <ZenButton variant="primary" className="w-full h-14 text-base">
                        Finalizar sesión
                    </ZenButton>
                </Link>

                {/* Rush mode: start or continue */}
                {canStartRush && onStartRushMode && (
                    <button onClick={onStartRushMode} className={rushBtnClass}>
                        <Flame size={16} /> Modo maratón
                    </button>
                )}
                {isRushMode && onStartRushMode && (
                    <button onClick={onStartRushMode} className={rushBtnClass}>
                        <Flame size={16} /> Continuar maratón
                    </button>
                )}

                {/* Study more (non-rush, not eligible for rush) */}
                {!canStartRush && !isRushMode && (
                    <button
                        onClick={() => window.location.reload()}
                        className="text-ink-faint hover:text-ink text-sm font-medium transition-colors py-2 w-full"
                    >
                        Estudiar más
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────

interface SummaryMetricProps {
    icon: ReactNode;
    value: string | number;
    label: string;
}

function SummaryMetric({ icon, value, label }: SummaryMetricProps) {
    return (
        <div className="bg-void/45 border border-border rounded-xl p-4 flex flex-col items-center gap-1">
            <div className="text-amber">{icon}</div>
            <span className="text-xl font-bold text-ink">{value}</span>
            <span className="label-kicker">{label}</span>
        </div>
    );
}
