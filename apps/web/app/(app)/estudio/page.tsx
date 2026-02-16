"use client";

import { useStudySession } from "@/hooks/useStudySession";
import { StudyCard } from "@/components/ui/StudyCard";
import { Loader2 } from "lucide-react";
import { StudySummary } from "./StudySummary";

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
        totalCards,
        stats
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
            <StudySummary
                totalCards={stats.total}
                correctCards={stats.correct}
                totalTimeMs={stats.durationMs}
            />
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
