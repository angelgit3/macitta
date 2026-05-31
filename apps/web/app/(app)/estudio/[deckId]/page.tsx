"use client";

import { GLOBAL_STUDY_DECK_ID, useStudySession } from "@/hooks/useStudySession";
import { StudyCard } from "@/components/ui/StudyCard";
import { Loader2, Flame, Shuffle } from "lucide-react";
import { StudySummary } from "./StudySummary";
import { use } from "react";

/**
 * StudySessionContent — renders the active flashcard study session.
 * Handles global vs. per-deck mode, rush mode, and the session summary screen.
 */
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
        startRushMode,
    } = useStudySession(deckId);

    // ── Loading state ────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-ink-faint">
                <Loader2 className="animate-spin w-8 h-8 text-accent" />
                <p className="text-sm uppercase tracking-wide">
                    {isGlobalStudy ? "Preparando estudio global..." : "Cargando mazo..."}
                </p>
            </div>
        );
    }

    // ── Session complete ─────────────────────────────────────
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

    // ── No cards available ───────────────────────────────────
    if (!currentCard) {
        return (
            <div className="h-full flex items-center justify-center text-ink-faint text-sm text-center px-6">
                {isGlobalStudy
                    ? "No hay tarjetas pendientes en tus mazos."
                    : "No hay tarjetas disponibles para este mazo."}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-24">

            {/* ── Session header ────────────────────────────── */}
            <div className="glass-card rounded-2xl p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                    {isRushMode       && <Flame   size={20} className="text-amber"  />}
                    {isGlobalStudy && !isRushMode && <Shuffle size={20} className="text-accent" />}
                    {isRushMode ? "Modo maratón" : isGlobalStudy ? "Estudio global" : "Estudio diario"}
                </h1>

                <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isRushMode
                        ? "text-amber bg-amber/10 border-amber/25"
                        : "text-ink-faint bg-void/50 border-border"
                }`}>
                    {progress} / {totalCards}
                </div>
            </div>

            {/* ── Flashcard ─────────────────────────────────── */}
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
