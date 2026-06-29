"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateTOEFLScore } from "@macitta/shared";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import type { TOEFLAnswerOption, TOEFLExam, TOEFLMode, TOEFLQuestion } from "@/types/models";
import {
    ArrowLeft, ArrowRight, CheckCircle2, Clock, Gauge,
    Loader2, Pause, Play, RotateCcw, Send, Volume2,
} from "lucide-react";
import Link from "next/link";

interface TOEFLPracticeClientProps {
    userId: string;
    exam: TOEFLExam;
    questions: TOEFLQuestion[];
    mode: TOEFLMode;
}

const TOEFL_AUDIO_BUCKET = "toefl-audio";
const PLAYBACK_RATES     = [0.8, 1, 1.2] as const;

/** Time limit per section in seconds (strict mode). */
const STRICT_LIMITS_SECONDS: Record<string, number> = {
    reading:   600,
    grammar:   300,
    listening: 120,
};

/** Format seconds as "M:SS". */
function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

/** Render an answer option as "a) Option text". */
function optionLabel(option: TOEFLAnswerOption): string {
    return `${option.id}) ${option.text}`;
}

/**
 * TOEFLPracticeClient — interactive exam session (flexible or strict mode).
 *
 * In **flexible** mode the student can navigate freely, control audio playback,
 * and review answers before submitting.
 *
 * In **strict** mode a countdown timer runs, backward navigation is locked,
 * audio plays once automatically, and the exam is submitted when time runs out.
 */
export function TOEFLPracticeClient({ userId, exam, questions, mode }: TOEFLPracticeClientProps) {
    const router   = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Submission guards
    const submittedRef          = useRef(false);
    const strictAudioAttemptedRef = useRef(false);

    // Session state
    const [currentIndex,  setCurrentIndex]  = useState(0);
    const [answers,       setAnswers]        = useState<Record<string, string>>({});
    const [startedAt]                        = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [submitting,    setSubmitting]     = useState(false);
    const [error,         setError]          = useState<string | null>(null);

    // Audio state
    const [audioProgress,     setAudioProgress]     = useState(0);
    const [audioDuration,     setAudioDuration]      = useState(0);
    const [playbackRate,      setPlaybackRate]       = useState(1);
    const [isPlaying,         setIsPlaying]          = useState(false);
    const [strictAudioStarted, setStrictAudioStarted] = useState(false);
    const [strictAudioEnded,   setStrictAudioEnded]   = useState(false);
    const [audioError,         setAudioError]         = useState(false);

    const isStrict           = mode === "strict";
    const currentQuestion    = questions[currentIndex];
    const answeredCount      = Object.keys(answers).length;
    const progress           = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
    const strictLimitSeconds = STRICT_LIMITS_SECONDS[exam.section] ?? 600;
    const remainingSeconds   = Math.max(0, strictLimitSeconds - elapsedSeconds);
    const displayedTime      = isStrict ? remainingSeconds : elapsedSeconds;

    const audioUrl = useMemo(() => {
        if (!exam.audio_path) return null;
        return supabase.storage.from(TOEFL_AUDIO_BUCKET).getPublicUrl(exam.audio_path).data.publicUrl;
    }, [exam.audio_path, supabase]);

    // ── Elapsed timer ───────────────────────────────────────
    useEffect(() => {
        const id = window.setInterval(() => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        }, 1000);
        return () => window.clearInterval(id);
    }, [startedAt]);

    // ── Auto-submit when strict timer hits zero ─────────────
    useEffect(() => {
        if (!isStrict || remainingSeconds > 0 || submittedRef.current) return;
        handleSubmit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    // ── Auto-start audio in strict listening mode ───────────
    useEffect(() => {
        if (!isStrict || exam.section !== "listening" || !audioUrl || strictAudioStarted || strictAudioAttemptedRef.current) return;
        strictAudioAttemptedRef.current = true;
        startStrictAudio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    // ── Handlers ────────────────────────────────────────────

    async function handleSubmit() {
        if (submitting || submittedRef.current || questions.length === 0) return;

        submittedRef.current = true;
        setSubmitting(true);
        setError(null);

        const attemptId   = crypto.randomUUID();
        const completedAt = new Date().toISOString();
        const timeTaken   = Math.max(1, elapsedSeconds || Math.round((Date.now() - startedAt) / 1000));
        const score       = calculateTOEFLScore(questions, answers, exam.scale_mapping);

        const answerRows = questions.map(q => ({
            attempt_id:  attemptId,
            question_id: q.id,
            user_choice: answers[q.id] ?? null,
            is_correct:  answers[q.id] === q.correct_option_id,
        }));

        const attempt = {
            id:           attemptId,
            user_id:      userId,
            exam_id:      exam.id,
            raw_score:    score.rawScore,
            scaled_score: score.scaledScore,
            time_taken:   timeTaken,
            mode,
            completed_at: completedAt,
        };

        // Persist offline-first (IndexedDB)
        await db.transaction("rw", db.toeflExams, db.toeflQuestions, db.toeflAttempts, db.toeflAnswers, async () => {
            await db.toeflExams.put(exam);
            await db.toeflQuestions.bulkPut(questions);
            await db.toeflAttempts.put(attempt);
            await db.toeflAnswers.bulkPut(answerRows);
        });

        // Sync to Supabase; queue if offline
        const { error: attemptError } = await supabase.from("user_exam_attempts").upsert(attempt, { onConflict: "id" });
        const { error: answersError } = attemptError
            ? { error: attemptError }
            : await supabase.from("user_question_answers").upsert(answerRows, { onConflict: "attempt_id,question_id" });

        if (attemptError || answersError) {
            await db.syncQueue.bulkAdd([
                { type: "insert_toefl_attempt", data: attempt,   created_at: completedAt },
                { type: "insert_toefl_answers", data: answerRows, created_at: completedAt },
            ]);
        }

        router.push(`/toefl/result/${attemptId}`);
    }

    function handleFinish() {
        if (!isStrict && answeredCount < questions.length) {
            const firstUnanswered = questions.findIndex(question => !answers[question.id]);
            if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
            const remaining = questions.length - answeredCount;
            setError(`Aún faltan ${remaining} ${remaining === 1 ? "respuesta" : "respuestas"}. Complétalas antes de enviar.`);
            return;
        }

        handleSubmit();
    }

    async function toggleAudio() {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) { await audio.play(); setIsPlaying(true); }
        else              { audio.pause();       setIsPlaying(false); }
    }

    function rewindAudio() {
        const audio = audioRef.current;
        if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5);
    }

    function changePlaybackRate(rate: number) {
        setPlaybackRate(rate);
        if (audioRef.current) audioRef.current.playbackRate = rate;
    }

    async function startStrictAudio() {
        const audio = audioRef.current;
        if (!audio || strictAudioStarted) return;
        audio.currentTime = 0;
        audio.playbackRate = 1;
        try {
            await audio.play();
            setStrictAudioStarted(true);
            setIsPlaying(true);
        } catch {
            setError("El navegador bloqueó el inicio automático del audio. Pulsa iniciar para comenzar el audio una sola vez.");
        }
    }

    // ── Early return: no questions ──────────────────────────
    if (!currentQuestion) {
        return (
            <div className="text-center py-16 text-ink-faint">
                Esta práctica todavía no tiene preguntas.
            </div>
        );
    }

    // ── Shared button class for audio controls ──────────────
    const audioCtrlClass = "min-h-11 px-3 rounded-xl bg-void border border-border text-ink-muted hover:text-ink flex items-center gap-2 transition-colors";

    return (
        <div className="flex flex-col gap-5 pb-24">

            {/* ── Header + progress ─────────────────────────── */}
            <header className="space-y-4">
                <Link href="/toefl" className="inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink transition-colors">
                    <ArrowLeft size={16} /> Volver a prácticas
                </Link>

                <div className="product-panel rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <p className="section-label text-accent">
                                {exam.section} · {isStrict ? "estricto" : "flexible"}
                            </p>
                            <h1 className="text-xl font-black text-ink leading-tight mt-1">{exam.title}</h1>
                        </div>
                        <div className="flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-void px-3 text-xs font-bold text-ink-muted" aria-label={isStrict ? "Tiempo restante" : "Tiempo transcurrido"}>
                            <Clock size={13} /> {formatTime(displayedTime)}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 overflow-hidden rounded-full bg-void" role="progressbar" aria-label="Progreso de respuestas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                        <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-ink-faint mt-2">{answeredCount} de {questions.length} respondidas</p>

                    {isStrict && (
                        <p className="text-xs text-amber mt-2">
                            Simulacro estricto: cuenta regresiva, navegación hacia atrás bloqueada y envío automático al llegar a cero.
                        </p>
                    )}
                </div>
            </header>

            {/* ── Audio player (listening section) ──────────── */}
            {exam.section === "listening" && (
                <section className="product-panel rounded-2xl p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber/10 text-amber flex items-center justify-center shrink-0">
                            <Volume2 size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="section-label text-amber">Audio {isStrict ? "estricto" : "flexible"}</p>
                            <h2 className="text-lg font-black text-ink mt-1">Escucha el diálogo antes de responder</h2>
                            <p className="text-xs text-ink-faint mt-1">
                                {isStrict
                                    ? "El audio se reproduce una sola vez y sin controles."
                                    : "La transcripción se mostrará solo en la revisión."}
                            </p>
                        </div>
                    </div>

                    {audioUrl && !audioError ? (
                        <>
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                preload="metadata"
                                onLoadedMetadata={e => {
                                    e.currentTarget.playbackRate = playbackRate;
                                    setAudioDuration(e.currentTarget.duration || 0);
                                }}
                                onTimeUpdate={e => {
                                    const a = e.currentTarget;
                                    setAudioProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
                                }}
                                onEnded={() => { setIsPlaying(false); if (isStrict) setStrictAudioEnded(true); }}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                onError={() => {
                                    setAudioError(true);
                                    setIsPlaying(false);
                                    setError("No pudimos cargar el audio. Revisa tu conexión o vuelve a la lista de prácticas.");
                                }}
                            />

                            {/* Waveform visualizer */}
                            <div className="mt-5 flex h-14 items-center gap-1 overflow-hidden rounded-xl border border-border bg-void/70 px-4" aria-hidden="true">
                                {Array.from({ length: 36 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-full transition-colors ${isPlaying ? "bg-amber" : "bg-ink-faint/40"}`}
                                        style={{ height: `${28 + ((i * 17) % 22)}%`, opacity: i < Math.round(audioProgress / 3) ? 1 : 0.35 }}
                                    />
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {isStrict ? (
                                    <>
                                        {!strictAudioStarted && !strictAudioEnded && (
                                            <button type="button" onClick={startStrictAudio}
                                                className="flex min-h-11 items-center gap-2 rounded-xl bg-amber px-4 font-black text-void">
                                                <Play size={18} /> Iniciar audio
                                            </button>
                                        )}
                                        <div className={audioCtrlClass}>
                                            {strictAudioEnded ? "Audio finalizado" : "Sin pausa, velocidad ni retroceso"}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <button type="button" onClick={toggleAudio}
                                            className="flex min-h-11 items-center gap-2 rounded-xl bg-amber px-4 font-black text-void">
                                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                            {isPlaying ? "Pausar" : "Reproducir"}
                                        </button>
                                        <button type="button" onClick={rewindAudio} className={audioCtrlClass}>
                                            <RotateCcw size={16} /> 5s
                                        </button>
                                        <div className="flex min-h-11 items-center gap-1 rounded-xl border border-border bg-void px-2">
                                            <Gauge size={15} className="text-ink-faint ml-1" />
                                            {PLAYBACK_RATES.map(rate => (
                                                <button key={rate} type="button" onClick={() => changePlaybackRate(rate)}
                                                    className={`h-8 px-2 rounded-xl text-xs font-bold transition-colors ${playbackRate === rate ? "bg-amber text-void" : "text-ink-faint hover:text-ink"}`}>
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <span className="text-xs text-ink-faint ml-auto">
                                    {formatTime(Math.floor((audioProgress / 100) * audioDuration))} / {formatTime(Math.floor(audioDuration || 0))}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="mt-5 rounded-xl border border-amber/25 bg-amber/10 p-4 text-sm text-ink-muted" role="alert">
                            {audioError ? "El audio no está disponible en este momento." : "Esta práctica todavía no tiene un audio configurado."}
                        </div>
                    )}
                </section>
            )}

            {/* ── Passage + Questions ───────────────────────── */}
            <div className={exam.passage_text ? "grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start" : ""}>
                {exam.passage_text && (
                    <section className="max-h-[360px] overflow-y-auto rounded-2xl border border-border bg-void/60 p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-10rem)]">
                        <h2 className="section-label mb-3">Texto de referencia</h2>
                        <p className="text-sm leading-7 text-ink-muted">{exam.passage_text}</p>
                    </section>
                )}

                <section className="product-panel rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <span className="section-label">Pregunta {currentIndex + 1} de {questions.length}</span>
                        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg">
                            {currentQuestion.points_weight} pt
                        </span>
                    </div>

                    <h2 className="text-lg font-black text-ink leading-snug mb-5">{currentQuestion.question_text}</h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map(option => {
                            const selected = answers[currentQuestion.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => {
                                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.id }));
                                        setError(null);
                                    }}
                                    className={`min-h-14 w-full rounded-xl border p-4 text-left transition-colors ${
                                        selected
                                            ? "border-accent bg-accent/12 text-ink"
                                            : "border-border bg-void/40 text-ink-faint hover:text-ink hover:border-border-strong"
                                    }`}
                                >
                                    <span className="text-sm font-semibold leading-relaxed">{optionLabel(option)}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* ── Error ─────────────────────────────────────── */}
            {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger" role="alert" aria-live="polite">
                    {error}
                </div>
            )}

            {/* ── Navigation footer ─────────────────────────── */}
            <footer className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0 || isStrict}
                    aria-label="Ir a la pregunta anterior"
                    className="h-12 rounded-xl border border-border bg-surface px-4 text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowLeft size={18} />
                </button>

                {currentIndex < questions.length - 1 ? (
                    <button
                        type="button"
                        onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent font-bold text-void transition-colors hover:bg-accent-hover"
                    >
                        Siguiente <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleFinish}
                        disabled={submitting}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent font-bold text-void transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? <Loader2 className="animate-spin" size={18} />
                            : answeredCount === questions.length
                                ? <CheckCircle2 size={18} />
                                : <Send size={18} />}
                        {isStrict && submitting ? "Cerrando simulacro" : "Enviar práctica"}
                    </button>
                )}
            </footer>
        </div>
    );
}
