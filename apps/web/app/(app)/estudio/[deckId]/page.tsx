"use client";

import { GLOBAL_STUDY_DECK_ID, useStudySession } from "@/hooks/useStudySession";
import { StudyCard } from "@/components/ui/StudyCard";
import { Loader2, Flame, Shuffle } from "lucide-react";
import { StudySummary } from "./StudySummary";
import { use } from "react";

export default function StudySessionContent({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params);
    const isGlobalStudy = deckId === GLOBAL_STUDY_DECK_ID;

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
        stats,
        isRushMode,
        remainingDueCount,
        startRushMode
    } = useStudySession(deckId);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-text-dim">
                <Loader2 className="animate-spin w-8 h-8 text-accent-focus" />
                <p className="text-sm uppercase">
                    {isGlobalStudy ? "Preparando estudio global..." : "Cargando mazo..."}
                </p>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <StudySummary
                totalCards={stats.total}
                correctCards={stats.correct}
                totalTimeMs={stats.durationMs}
                isRushMode={isRushMode}
                remainingDueCount={remainingDueCount}
                onStartRushMode={startRushMode}
            />
        );
    }

    if (!currentCard) {
        return (
            <div className="h-full flex items-center justify-center text-text-dim">
                {isGlobalStudy ? "No hay tarjetas pendientes en tus mazos." : "No hay tarjetas disponibles para este mazo."}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-24">
            <div className="surface-card rounded-xl p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                    {isRushMode && <Flame size={20} className="text-accent-strong" />}
                    {isGlobalStudy && !isRushMode && <Shuffle size={20} className="text-accent-focus" />}
                    {isRushMode ? "Modo maraton" : isGlobalStudy ? "Estudio global" : "Estudio diario"}
                </h1>
                <div className={`text-xs font-bold px-3 py-1 rounded-full border ${isRushMode
                    ? "text-accent-strong bg-accent-strong/10 border-accent-strong/25"
                    : "text-text-dim bg-void/50 border-border-subtle"
                    }`}>
                    {progress} / {totalCards}
                </div>
            </div>

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
