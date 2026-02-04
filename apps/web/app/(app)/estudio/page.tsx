
"use client";

import { useStudySession } from "@/hooks/useStudySession";
import { StudyCard } from "@/components/ui/StudyCard";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ZenButton } from "@/components/ui/ZenButton";

export default function StudyPage() {
    const {
        loading,
        sessionComplete,
        currentCard,
        userAnswers,
        feedback,
        isRevealed,
        handleInputChange,
        submitAnswer,
        nextCard,
        progress,
        totalCards
    } = useStudySession();

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                <p className="text-sm tracking-wider uppercase">Cargando Mazo...</p>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white">¡Sesión Completada!</h1>
                    <p className="text-zinc-400">Has repasado {totalCards} tarjetas hoy.</p>
                </div>
                <Link href="/home">
                    <ZenButton variant="primary">Volver al Inicio</ZenButton>
                </Link>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-500">
                No hay tarjetas disponibles.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-xl mx-auto pb-24">
            {/* Header / Progress */}
            <div className="flex justify-between items-center px-2">
                <h1 className="text-xl font-bold text-white">Estudio Diario</h1>
                <div className="text-xs font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                    {progress} / {totalCards}
                </div>
            </div>

            {/* Active Card */}
            <StudyCard
                card={currentCard}
                userAnswers={userAnswers}
                feedback={feedback}
                isRevealed={isRevealed}
                onInputChange={handleInputChange}
                onSubmit={submitAnswer}
                onNext={nextCard}
            />
        </div>
    );
}
