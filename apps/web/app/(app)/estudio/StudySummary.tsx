import { Zap, Clock, Target, CheckCircle, Flame } from "lucide-react";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";

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
        <div className="h-full flex flex-col items-center justify-center gap-8 text-center animate-in fade-in zoom-in-95 duration-700 max-w-md mx-auto">
            <div className="relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 ${isRushMode ? 'bg-orange-500/10' : 'bg-accent-focus/10'
                    }`}>
                    {isRushMode
                        ? <Flame className="w-12 h-12 text-orange-500" />
                        : <CheckCircle className="w-12 h-12 text-accent-focus" />
                    }
                </div>
                <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isRushMode ? 'bg-orange-500/20' : 'bg-accent-focus/20'
                    }`} />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight">
                    {isRushMode ? '¡Maratón completo!' : '¡Misión cumplida!'}
                </h1>
                <p className="text-zinc-400 font-medium">
                    {isRushMode
                        ? 'Has reforzado tu memoria extra hoy.'
                        : 'Has fortalecido tu memoria hoy.'
                    }
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
                <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex flex-col items-center gap-1">
                    <Target size={18} className="text-blue-400" />
                    <span className="text-xl font-bold">{totalCards}</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-dim">Vistos</span>
                </div>
                <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex flex-col items-center gap-1">
                    <Zap size={18} className="text-yellow-400" />
                    <span className="text-xl font-bold">{accuracy}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-dim">Puntería</span>
                </div>
                <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex flex-col items-center gap-1">
                    <Clock size={18} className="text-green-400" />
                    <span className="text-xl font-bold">{timeFormatted}</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-dim">Tiempo</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Link href="/dashboard" className="w-full">
                    <ZenButton variant="primary" className="w-full h-14 text-lg">
                        Finalizar Sesión
                    </ZenButton>
                </Link>

                {/* Rush Mode: Unlocked when 0 due cards remaining */}
                {canStartRush && onStartRushMode && (
                    <button
                        onClick={onStartRushMode}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    >
                        <Flame size={16} />
                        Modo Maratón
                    </button>
                )}

                {/* Rush Mode: Continue with another batch */}
                {isRushMode && onStartRushMode && (
                    <button
                        onClick={onStartRushMode}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 font-bold text-sm uppercase tracking-wider transition-all duration-300"
                    >
                        <Flame size={16} />
                        Continuar Maratón
                    </button>
                )}

                {/* Normal: Study more (still has due cards) */}
                {!canStartRush && !isRushMode && (
                    <Link href="/estudio" className="w-full">
                        <button className="text-zinc-500 hover:text-white text-sm font-medium transition-colors py-2 w-full">
                            Estudiar más
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
