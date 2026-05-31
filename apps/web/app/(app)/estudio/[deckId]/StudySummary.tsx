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

export function StudySummary({
    totalCards,
    correctCards,
    totalTimeMs,
    isRushMode = false,
    remainingDueCount,
    onStartRushMode
}: StudySummaryProps) {
    const timeFormatted = totalTimeMs > 60000
        ? `${(totalTimeMs / 60000).toFixed(1)} min`
        : `${(totalTimeMs / 1000).toFixed(0)} seg`;

    const accuracy = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;
    const canStartRush = !isRushMode && remainingDueCount === 0;

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 text-center animate-in fade-in zoom-in-95 duration-700 max-w-xl mx-auto">
            <div className="surface-panel rounded-xl p-8 w-full">
                <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto bg-accent-focus/10 border border-accent-focus/20">
                    {isRushMode
                        ? <Flame className="w-10 h-10 text-accent-strong" />
                        : <CheckCircle className="w-10 h-10 text-accent-focus" />
                    }
                </div>

                <div className="space-y-2 mt-6">
                    <h1 className="text-4xl font-black text-ink">
                        {isRushMode ? 'Maraton completo' : 'Mision cumplida'}
                    </h1>
                    <p className="readable-copy">
                        {isRushMode
                            ? 'Has reforzado tu memoria extra hoy.'
                            : 'Has fortalecido tu memoria hoy.'
                        }
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full mt-7">
                    <SummaryMetric icon={<Target size={18} />} value={totalCards} label="Vistos" />
                    <SummaryMetric icon={<Zap size={18} />} value={`${accuracy}%`} label="Punteria" />
                    <SummaryMetric icon={<Clock size={18} />} value={timeFormatted} label="Tiempo" />
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Link href="/dashboard" className="w-full">
                    <ZenButton variant="primary" className="w-full h-14 text-lg">
                        Finalizar sesion
                    </ZenButton>
                </Link>

                {canStartRush && onStartRushMode && (
                    <button
                        onClick={onStartRushMode}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-accent-strong/40 bg-accent-strong/10 text-accent-strong hover:bg-accent-strong/20 font-bold text-sm uppercase transition-all duration-200"
                    >
                        <Flame size={16} />
                        Modo maraton
                    </button>
                )}

                {isRushMode && onStartRushMode && (
                    <button
                        onClick={onStartRushMode}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-accent-strong/40 bg-accent-strong/10 text-accent-strong hover:bg-accent-strong/20 font-bold text-sm uppercase transition-all duration-200"
                    >
                        <Flame size={16} />
                        Continuar maraton
                    </button>
                )}

                {!canStartRush && !isRushMode && (
                    <button onClick={() => window.location.reload()} className="text-text-dim hover:text-ink text-sm font-medium transition-colors py-2 w-full">
                        Estudiar mas
                    </button>
                )}
            </div>
        </div>
    );
}

function SummaryMetric({ icon, value, label }: { icon: ReactNode; value: string | number; label: string }) {
    return (
        <div className="bg-void/45 border border-border-subtle rounded-lg p-4 flex flex-col items-center gap-1">
            <div className="text-accent-strong">{icon}</div>
            <span className="text-xl font-bold">{value}</span>
            <span className="text-[10px] uppercase text-text-dim">{label}</span>
        </div>
    );
}
