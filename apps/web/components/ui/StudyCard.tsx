import React, { useRef, useEffect } from "react";
import { Check, X, ArrowRight, CornerDownLeft } from "lucide-react";
import type { CardData, SlotFeedback } from "@/hooks/useStudySession";

interface StudyCardProps {
    card: CardData;
    userAnswers: Record<string, string>;
    feedback: Record<string, SlotFeedback>;
    isRevealed: boolean;
    onInputChange: (slotId: string, value: string) => void;
    onSubmit: () => void;
    onNext: () => void;
}

export function StudyCard({
    card,
    userAnswers,
    feedback,
    isRevealed,
    onInputChange,
    onSubmit,
    onNext,
}: StudyCardProps) {
    // Refs for input management
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Reset refs when card changes
        inputRefs.current = inputRefs.current.slice(0, card.slots.length);
        if (!isRevealed && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
        // Focus submit/next button when revealed so Enter works to proceed
        if (isRevealed && submitButtonRef.current) {
            submitButtonRef.current.focus();
        }
    }, [card.id, isRevealed, card.slots.length]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number, slotId: string) => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (isRevealed) {
                onNext();
                return;
            }

            // If there's a next slot, focus it
            if (index < card.slots.length - 1) {
                inputRefs.current[index + 1]?.focus();
            } else {
                // Last slot -> Submit
                onSubmit();
            }
        }

        if (e.key === "Backspace") {
            const currentValue = userAnswers[slotId] || "";
            if (currentValue === "" && index > 0) {
                // Go back to previous input if current is empty
                e.preventDefault(); // Good UX to prevent back nav potentially
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-zinc-900 rounded-3xl border border-white/5 p-8 relative flex flex-col gap-8 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />

            {/* Question Header */}
            <div className="z-10 text-center space-y-2">
                <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
                    Verbo Irregular
                </span>
                <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
                    {card.question}
                </h1>
            </div>

            {/* Slots / Inputs */}
            <div className="z-10 flex flex-col gap-4">
                {card.slots.map((slot, index) => {
                    const slotState = feedback[slot.id];
                    const isCorrect = slotState?.status === 'correct';
                    const isIncorrect = slotState?.status === 'incorrect';
                    const inputValue = userAnswers[slot.id] || "";

                    return (
                        <div key={slot.id} className="group relative">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-1 block">
                                {slot.label}
                                {slot.match_type === 'all' && <span className="text-blue-500/50 ml-1">(Todas las formas)</span>}
                            </label>

                            <div className="relative">
                                <input
                                    ref={el => { inputRefs.current[index] = el }}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => onInputChange(slot.id, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, slot.id)}
                                    disabled={isRevealed}
                                    autoComplete="off"
                                    className={`
                                        w-full bg-black/40 border-2 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder-zinc-700 outline-none transition-all
                                        ${isRevealed
                                            ? isCorrect
                                                ? "border-green-500/50 bg-green-500/10 text-green-200"
                                                : "border-red-500/50 bg-red-500/10 text-red-200"
                                            : "border-white/10 focus:border-blue-500/50 focus:bg-white/5"
                                        }
                                    `}
                                    placeholder="..."
                                />

                                {/* Icons */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                    {isRevealed && isCorrect && <Check className="text-green-400 w-5 h-5" />}
                                    {isRevealed && isIncorrect && <X className="text-red-400 w-5 h-5" />}
                                </div>
                            </div>

                            {/* Correction / Answer Display */}
                            {isRevealed && isIncorrect && (
                                <div className="mt-2 text-sm text-green-400/90 pl-1 animate-in fade-in slide-in-from-top-1">
                                    <span className="opacity-50 text-xs uppercase mr-2">Respuesta:</span>
                                    {slot.accepted_answers.join(", ")}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Button */}
            <div className="z-10 mt-2">
                <button
                    ref={submitButtonRef}
                    onClick={isRevealed ? onNext : onSubmit}
                    className={`
                        w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold tracking-wide transition-all transform active:scale-95
                        ${isRevealed
                            ? "bg-white text-black hover:bg-zinc-200"
                            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                        }
                    `}
                >
                    {isRevealed ? (
                        <>Siguiente <ArrowRight size={20} /></>
                    ) : (
                        <>Comprobar <CornerDownLeft size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
