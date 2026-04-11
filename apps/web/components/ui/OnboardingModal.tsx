'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { BookOpen, Flame, Users, ChevronRight, CheckCircle2, Loader2, Hash, AlertCircle } from 'lucide-react';

const SLIDES = [
    {
        icon: Logo,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        title: '¡Bienvenido a Macitta!',
        body: 'Tu plataforma de estudio de verbos con repetición espaciada. Aprende más en menos tiempo con un método que se adapta a ti.',
    },
    {
        icon: BookOpen,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        title: 'Sesiones de estudio',
        body: 'Cada día aparecen las tarjetas que más necesitas repasar. Responde con honestidad — el algoritmo ajusta la frecuencia automáticamente.',
    },
    {
        icon: Flame,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        title: 'Mantén tu racha',
        body: 'Estudia aunque sea 5 minutos cada día para mantener tu racha viva. La constancia es lo que marca la diferencia a largo plazo.',
    },
] as const;

// Steps: 0..2 = slides, 3 = join class (opcional), 4 = username setup
const STEP_JOIN_CLASS = SLIDES.length;      // 3
const STEP_USERNAME   = SLIDES.length + 1;  // 4

interface OnboardingModalProps {
    userId: string;
    onDone: () => void;
}

export function OnboardingModal({ userId, onDone }: OnboardingModalProps) {
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [username, setUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Join class state
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinSuccess, setJoinSuccess] = useState(false);

    const isLastSlide    = step === SLIDES.length - 1;
    const isJoinClassStep = step === STEP_JOIN_CLASS;
    const isUsernameStep  = step === STEP_USERNAME;

    // ── Finish: save username and mark onboarding done ──────────────────────
    async function handleFinish() {
        if (username.trim().length < 3) {
            setError('El nombre debe tener al menos 3 caracteres.');
            return;
        }
        setSaving(true);
        setError(null);

        const { error: dbError } = await supabase
            .from('profiles')
            .update({ username: username.trim(), onboarding_done: true })
            .eq('id', userId);

        if (dbError) {
            setSaving(false);
            setError('Error al guardar. Intenta de nuevo.');
            return;
        }
        onDone();
    }

    async function skipToFinish() {
        await supabase.from('profiles').update({ onboarding_done: true }).eq('id', userId);
        onDone();
    }

    // ── Join class by code ───────────────────────────────────────────────────
    async function handleJoinClass() {
        const code = joinCode.trim().toUpperCase();
        if (!code) {
            setJoinError('Ingresa el código de tu maestro.');
            return;
        }
        setJoining(true);
        setJoinError(null);

        // 1. Find classroom by join_code
        const { data: classroom, error: classErr } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('join_code', code)
            .single();

        if (classErr || !classroom) {
            setJoinError('Código inválido. Pídeselo de nuevo a tu maestro.');
            setJoining(false);
            return;
        }

        // 2. Insert membership
        const { error: insertErr } = await supabase
            .from('classroom_students')
            .insert({ classroom_id: classroom.id, student_id: userId });

        if (insertErr?.code === '23505') {
            // Already a member — treat as success
            setJoinSuccess(true);
        } else if (insertErr) {
            setJoinError('No se pudo unir a la clase. Intenta de nuevo.');
        } else {
            setJoinSuccess(true);
        }
        setJoining(false);
    }

    const currentSlide = step < SLIDES.length ? SLIDES[step] : null;
    const totalSteps   = STEP_USERNAME + 1; // for progress bar

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">

                {/* Progress bar */}
                <div className="h-1 bg-white/5">
                    <div
                        className="h-full bg-accent-focus transition-all duration-500"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-7">
                    {/* ── Slides ─────────────────────────────────────────── */}
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
                                onClick={() => isLastSlide ? setStep(STEP_JOIN_CLASS) : setStep(s => s + 1)}
                                className="w-full h-13 py-3.5 bg-accent-focus text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-focus/90 transition-colors text-sm"
                            >
                                {isLastSlide ? 'Unirse a mi clase' : 'Siguiente'}
                                <ChevronRight size={16} />
                            </button>

                            {/* Dot indicators */}
                            <div className="flex gap-2">
                                {SLIDES.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-accent-focus' : 'w-1.5 bg-white/20'}`} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Unirse a clase ─────────────────────────────────── */}
                    {isJoinClassStep && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                                    <Users size={28} className="text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-black mb-1.5">Únete a tu clase</h2>
                                <p className="text-text-dim text-sm">
                                    Pídele el código a tu maestro e ingrésalo aquí para conectarte al grupo.
                                </p>
                            </div>

                            {!joinSuccess ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">
                                            Código del grupo
                                        </label>
                                        <div className="relative">
                                            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
                                            <input
                                                type="text"
                                                value={joinCode}
                                                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(null); }}
                                                placeholder="Ej: ABC123"
                                                maxLength={12}
                                                autoFocus
                                                className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3.5 pl-10 pr-4 text-white font-mono tracking-widest focus:outline-none focus:border-accent-focus transition-colors text-sm uppercase"
                                            />
                                        </div>
                                        {joinError && (
                                            <p className="text-xs text-red-400 ml-1 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {joinError}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleJoinClass}
                                        disabled={joining || !joinCode.trim()}
                                        className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {joining ? <Loader2 className="animate-spin" size={16} /> : <>Unirme <ChevronRight size={16} /></>}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                                    <p className="font-semibold text-emerald-400">¡Listo! Ya eres parte del grupo.</p>
                                </div>
                            )}

                            <button
                                onClick={() => setStep(STEP_USERNAME)}
                                className="text-xs text-text-dim/60 hover:text-text-dim transition-colors text-center"
                            >
                                {joinSuccess ? 'Continuar →' : 'Saltar por ahora'}
                            </button>
                        </div>
                    )}

                    {/* ── Username step ──────────────────────────────────── */}
                    {isUsernameStep && (
                        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent-focus/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={28} className="text-accent-focus" />
                                </div>
                                <h2 className="text-xl font-black mb-1.5">¡Casi listo!</h2>
                                <p className="text-text-dim text-sm">¿Cómo quieres que te vean tus compañeros y maestros?</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">Tu nombre de usuario</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => { setUsername(e.target.value); setError(null); }}
                                    placeholder="Ej: juandev, maria_m, etc."
                                    maxLength={32}
                                    autoFocus
                                    className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors text-sm"
                                />
                                {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={saving || username.trim().length < 3}
                                className="w-full py-3.5 bg-accent-focus text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-focus/90 transition-colors disabled:opacity-50 text-sm"
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
