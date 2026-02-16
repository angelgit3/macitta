import { Zap, Clock, Target, CheckCircle } from "lucide-react";
import { ZenButton } from "@/components/ui/ZenButton";
import Link from "next/link";

interface StudySummaryProps {
    totalCards: number;
    correctCards: number;
    totalTimeMs: number;
}

export function StudySummary({ totalCards, correctCards, totalTimeMs }: StudySummaryProps) {
    const timeFormatted = totalTimeMs > 60000
        ? `${(totalTimeMs / 60000).toFixed(1)} min`
        : `${(totalTimeMs / 1000).toFixed(0)} seg`;

    const accuracy = totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0;

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 text-center animate-in fade-in zoom-in-95 duration-700 max-w-md mx-auto">
            <div className="relative">
                <div className="w-24 h-24 bg-accent-focus/10 rounded-full flex items-center justify-center relative z-10">
                    <CheckCircle className="w-12 h-12 text-accent-focus" />
                </div>
                <div className="absolute inset-0 bg-accent-focus/20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight">¡Misión cumplida!</h1>
                <p className="text-zinc-400 font-medium">Has fortalecido tu memoria hoy.</p>
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
                <Link href="/estudio" className="w-full">
                    <button className="text-zinc-500 hover:text-white text-sm font-medium transition-colors py-2">
                        Estudiar más
                    </button>
                </Link>
            </div>
        </div>
    );
}
