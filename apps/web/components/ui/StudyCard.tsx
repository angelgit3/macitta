import React, { useRef, useEffect } from "react";
import { Check, X, ArrowRight, CornerDownLeft } from "lucide-react";
import type { CardData, SlotFeedback } from "@/types/study";

interface StudyCardProps {
  card: CardData;
  userAnswers: Record<string, string>;
  feedback: Record<string, SlotFeedback>;
  isRevealed: boolean;
  onInputChange: (slotId: string, value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

/**
 * StudyCard — Estudio Lúmico
 * The core study instrument: double-bezel glass plate with haptic inputs.
 */
export function StudyCard({
  card,
  userAnswers,
  feedback,
  isRevealed,
  onInputChange,
  onSubmit,
  onNext,
}: StudyCardProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, card.slots.length);
    if (!isRevealed && inputRefs.current[0]) inputRefs.current[0].focus();
    if (isRevealed && submitButtonRef.current) submitButtonRef.current.focus();
  }, [card.id, isRevealed, card.slots.length]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, slotId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isRevealed) { onNext(); return; }
      if (index < card.slots.length - 1) inputRefs.current[index + 1]?.focus();
      else onSubmit();
    }
    if (e.key === "Backspace") {
      const currentValue = userAnswers[slotId] || "";
      if (currentValue === "" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    /* ── Outer shell (Double-Bezel) ── */
    <div className="mx-auto w-full max-w-2xl">
      {/* ── Inner core ── */}
      <div
        className="relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] sm:p-9"
      >
        {/* Accent gradient top */}
        {/* Background glow */}

        {/* Word header */}
        <div className="relative z-10 text-center space-y-2.5">
          <span className="text-sm font-bold text-accent">
            Completa la tarjeta
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight">
            {card.front_text}
          </h1>
        </div>

        {/* Slots */}
        <div className="relative z-10 grid gap-4">
          {card.slots.map((slot, index) => {
            const slotState = feedback[slot.id];
            const isCorrect   = slotState?.status === "correct";
            const isIncorrect = slotState?.status === "incorrect";
            const inputValue  = userAnswers[slot.id] || "";

            return (
              <div key={slot.id} className="group relative">
                <label className="mb-2 ml-1 block text-sm font-bold text-ink-muted">
                  {slot.label}
                  {slot.match_type === "all" && (
                    <span className="text-accent/60 ml-1">(todas las formas)</span>
                  )}
                </label>

                <div className="relative">
                  <input
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    value={inputValue}
                    onChange={e => onInputChange(slot.id, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, index, slot.id)}
                    disabled={isRevealed}
                    autoComplete="off"
                    placeholder="..."
                    className={`
                      w-full rounded-xl px-5 py-4 text-lg font-medium
                      border-2 transition-all duration-200
                      placeholder:text-ink-faint/40 disabled:cursor-not-allowed
                      ${isRevealed
                        ? isCorrect
                          ? "border-success/50 bg-success/8 text-success"
                          : "border-danger/50 bg-danger/8 text-danger"
                        : `soft-field border-border focus:border-accent/60
                           focus:shadow-[0_0_0_3px_rgba(124,133,232,0.12)]`
                      }
                    `}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                    {isRevealed && isCorrect   && <Check className="text-success w-5 h-5" />}
                    {isRevealed && isIncorrect && <X     className="text-danger  w-5 h-5" />}
                  </div>
                </div>

                {isRevealed && isIncorrect && (
                  <div className="mt-2 text-sm text-success pl-1 animate-in fade-in slide-in-from-top-1">
                    <span className="opacity-55 text-xs uppercase mr-2">Respuesta:</span>
                    {slot.accepted_answers.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="relative z-10">
          <button
            ref={submitButtonRef}
            onClick={isRevealed ? onNext : onSubmit}
            className={`
              flex min-h-14 w-full items-center justify-center gap-2 rounded-xl font-black
              transition-[background-color,border-color,transform] duration-200 active:scale-[0.985]
              ${isRevealed
                ? "bg-success/15 text-success border border-success/30 hover:bg-success/22 hover:border-success/45"
                : "border border-accent/20 bg-accent text-void hover:bg-accent-hover"
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
    </div>
  );
}
