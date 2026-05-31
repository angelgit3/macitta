"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { BookOpen, Flame, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

const SLIDES = [
    {
        icon: Logo,
        color: "text-paper-soft",
        bg: "bg-void/60 border border-paper-soft/15",
        title: "Bienvenido a Macitta",
        body: "Tu plataforma de estudio de verbos con repeticion espaciada. Aprende mas en menos tiempo con un metodo que se adapta a ti.",
    },
    {
        icon: BookOpen,
        color: "text-accent-focus",
        bg: "bg-accent-focus/10",
        title: "Sesiones de estudio",
        body: "Cada dia aparecen las tarjetas que mas necesitas repasar. Responde con honestidad y el algoritmo ajusta la frecuencia automaticamente.",
    },
    {
        icon: Flame,
        color: "text-accent-strong",
        bg: "bg-accent-strong/10",
        title: "Manten tu racha",
        body: "Estudia aunque sea 5 minutos cada dia para mantener tu racha viva. La constancia es lo que marca la diferencia a largo plazo.",
    },
] as const;

const STEP_USERNAME = SLIDES.length;

interface OnboardingModalProps {
    userId: string;
    onDone: () => void;
}

export function OnboardingModal({ userId, onDone }: OnboardingModalProps) {
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [username, setUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLastSlide = step === SLIDES.length - 1;
    const isUsernameStep = step === STEP_USERNAME;
    const currentSlide = step < SLIDES.length ? SLIDES[step] : null;
    const totalSteps = STEP_USERNAME + 1;

    async function handleFinish() {
        if (username.trim().length < 3) {
            setError("El nombre debe tener al menos 3 caracteres.");
            return;
        }
        setSaving(true);
        setError(null);

        const { error: dbError } = await supabase
            .from("profiles")
            .update({ username: username.trim(), onboarding_done: true })
            .eq("id", userId);

        if (dbError) {
            setSaving(false);
            setError("Error al guardar. Intenta de nuevo.");
            return;
        }
        onDone();
    }

    async function skipToFinish() {
        await supabase.from("profiles").update({ onboarding_done: true }).eq("id", userId);
        onDone();
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-1 bg-ink/5">
                    <div
                        className="h-full bg-accent-focus transition-all duration-500"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-7">
                    {currentSlide && (
                        <div key={step} className="flex flex-col items-center text-center gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${currentSlide.bg}`}>
                                <currentSlide.icon size={36} className={currentSlide.color} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-2">{currentSlide.title}</h2>
                                <p className="text-text-dim text-sm leading-relaxed">{currentSlide.body}</p>
                            </div>

                            <button
                                onClick={() => isLastSlide ? setStep(STEP_USERNAME) : setStep((s) => s + 1)}
                                className="w-full h-13 py-3.5 bg-brand-primary text-paper border border-paper-soft/25 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-light transition-colors text-sm"
                            >
                                {isLastSlide ? "Configurar perfil" : "Siguiente"}
                                <ChevronRight size={16} />
                            </button>

                            <div className="flex gap-2">
                                {SLIDES.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-accent-focus" : "w-1.5 bg-ink/20"}`} />
                                ))}
                            </div>
                        </div>
                    )}

                    {isUsernameStep && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent-focus/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={28} className="text-accent-focus" />
                                </div>
                                <h2 className="text-xl font-black mb-1.5">Casi listo</h2>
                                <p className="text-text-dim text-sm">Elige como quieres ver tu nombre dentro de Macitta.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Tu nombre de usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(null); }}
                                    placeholder="Ej: juandev, maria_m, etc."
                                    maxLength={32}
                                    autoFocus
                                    className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3.5 px-4 text-ink focus:outline-none focus:border-accent-focus transition-colors text-sm"
                                />
                                {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={saving || username.trim().length < 3}
                                className="w-full py-3.5 bg-brand-primary text-paper border border-paper-soft/25 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-light transition-colors disabled:opacity-50 text-sm"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <>Empezar a estudiar <ChevronRight size={16} /></>}
                            </button>

                            <button onClick={skipToFinish} className="text-xs text-text-dim/60 hover:text-text-dim transition-colors text-center">
                                Saltar por ahora
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
