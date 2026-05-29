"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateTOEFLScore } from "@maccita/shared";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import type { TOEFLAnswerOption, TOEFLExam, TOEFLMode, TOEFLQuestion } from "@/types/models";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Gauge, Loader2, Pause, Play, RotateCcw, Send, Volume2 } from "lucide-react";
import Link from "next/link";

interface TOEFLPracticeClientProps {
    userId: string;
    exam: TOEFLExam;
    questions: TOEFLQuestion[];
    mode: TOEFLMode;
}

const TOEFL_AUDIO_BUCKET = "toefl-audio";
const PLAYBACK_RATES = [0.8, 1, 1.2];
const STRICT_LIMITS_SECONDS: Record<string, number> = {
    reading: 600,
    grammar: 300,
    listening: 120,
};

function optionLabel(option: TOEFLAnswerOption) {
    return `${option.id}) ${option.text}`;
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TOEFLPracticeClient({ userId, exam, questions, mode }: TOEFLPracticeClientProps) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const submittedRef = useRef(false);
    const strictAudioAttemptedRef = useRef(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [startedAt] = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [strictAudioStarted, setStrictAudioStarted] = useState(false);
    const [strictAudioEnded, setStrictAudioEnded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isStrict = mode === "strict";
    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
    const strictLimitSeconds = STRICT_LIMITS_SECONDS[exam.section] ?? 600;
    const remainingSeconds = Math.max(0, strictLimitSeconds - elapsedSeconds);
    const displayedTime = isStrict ? remainingSeconds : elapsedSeconds;
    const audioUrl = useMemo(() => {
        if (!exam.audio_path) return null;
        return supabase.storage.from(TOEFL_AUDIO_BUCKET).getPublicUrl(exam.audio_path).data.publicUrl;
    }, [exam.audio_path, supabase]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [startedAt]);

    useEffect(() => {
        if (!isStrict || remainingSeconds > 0 || submittedRef.current) return;
        handleSubmit();
    });

    async function handleSubmit() {
        if (submitting || submittedRef.current || questions.length === 0) return;

        submittedRef.current = true;
        setSubmitting(true);
        setError(null);

        const attemptId = crypto.randomUUID();
        const completedAt = new Date().toISOString();
        const timeTaken = Math.max(1, elapsedSeconds || Math.round((Date.now() - startedAt) / 1000));
        const score = calculateTOEFLScore(questions, answers, exam.scale_mapping);
        const answerRows = questions.map((question) => ({
            attempt_id: attemptId,
            question_id: question.id,
            user_choice: answers[question.id] ?? null,
            is_correct: answers[question.id] === question.correct_option_id,
        }));

        const attempt = {
            id: attemptId,
            user_id: userId,
            exam_id: exam.id,
            raw_score: score.rawScore,
            scaled_score: score.scaledScore,
            time_taken: timeTaken,
            mode,
            completed_at: completedAt,
        };

        await db.transaction("rw", db.toeflExams, db.toeflQuestions, db.toeflAttempts, db.toeflAnswers, async () => {
            await db.toeflExams.put(exam);
            await db.toeflQuestions.bulkPut(questions);
            await db.toeflAttempts.put(attempt);
            await db.toeflAnswers.bulkPut(answerRows);
        });

        const { error: attemptError } = await supabase.from("user_exam_attempts").upsert(attempt, { onConflict: "id" });
        const { error: answersError } = attemptError
            ? { error: attemptError }
            : await supabase.from("user_question_answers").upsert(answerRows, { onConflict: "attempt_id,question_id" });

        if (attemptError || answersError) {
            await db.syncQueue.bulkAdd([
                {
                    type: "insert_toefl_attempt",
                    data: attempt,
                    created_at: new Date().toISOString(),
                },
                {
                    type: "insert_toefl_answers",
                    data: answerRows,
                    created_at: new Date().toISOString(),
                },
            ]);
        }

        router.push(`/toefl/result/${attemptId}`);
    }

    async function toggleAudio() {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            await audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    }

    function rewindAudio() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, audio.currentTime - 5);
    }

    function changePlaybackRate(rate: number) {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
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

    useEffect(() => {
        if (!isStrict || exam.section !== "listening" || !audioUrl || strictAudioStarted || strictAudioAttemptedRef.current) return;
        strictAudioAttemptedRef.current = true;
        startStrictAudio();
    });

    if (!currentQuestion) {
        return (
            <div className="text-center py-16 text-text-dim">
                Esta práctica todavía no tiene preguntas.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 pb-24">
            <header className="space-y-4">
                <Link href="/toefl" className="inline-flex items-center gap-1 text-sm text-text-dim hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Volver a prácticas
                </Link>

                <div className="bg-stone-surface border border-border-subtle rounded-3xl p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-accent-focus font-bold">
                                {exam.section} · {isStrict ? "estricto" : "flexible"}
                            </p>
                            <h1 className="text-xl font-black text-white leading-tight mt-1">{exam.title}</h1>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-dim bg-void rounded-full px-3 py-1.5 border border-border-subtle">
                            <Clock size={13} />
                            {formatTime(displayedTime)}
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-void overflow-hidden">
                        <div className="h-full bg-accent-focus transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-text-dim mt-2">{answeredCount} de {questions.length} respondidas</p>
                    {isStrict && (
                        <p className="text-xs text-amber-200 mt-2">
                            Simulacro estricto: cuenta regresiva, navegación hacia atrás bloqueada y envío automático al llegar a cero.
                        </p>
                    )}
                </div>
            </header>

            {exam.section === "listening" && (
                <section className="bg-stone-surface border border-border-subtle rounded-3xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                            <Volume2 size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                Audio {isStrict ? "estricto" : "flexible"}
                            </p>
                            <h2 className="text-lg font-black text-white mt-1">Escucha el diálogo antes de responder</h2>
                            <p className="text-xs text-text-dim mt-1">
                                {isStrict ? "El audio se reproduce una sola vez y sin controles." : "La transcripción se mostrará solo en la revisión."}
                            </p>
                        </div>
                    </div>

                    {audioUrl ? (
                        <>
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                preload="metadata"
                                onLoadedMetadata={(event) => {
                                    event.currentTarget.playbackRate = playbackRate;
                                    setAudioDuration(event.currentTarget.duration || 0);
                                }}
                                onTimeUpdate={(event) => {
                                    const audio = event.currentTarget;
                                    setAudioProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
                                }}
                                onEnded={() => {
                                    setIsPlaying(false);
                                    if (isStrict) setStrictAudioEnded(true);
                                }}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                            />
                            <div className="mt-5 h-14 rounded-2xl bg-void/70 border border-border-subtle px-4 flex items-center gap-1 overflow-hidden">
                                {Array.from({ length: 36 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`flex-1 rounded-full transition-colors ${isPlaying ? "bg-amber-300" : "bg-text-dim/40"}`}
                                        style={{ height: `${28 + ((index * 17) % 22)}%`, opacity: index < Math.round(audioProgress / 3) ? 1 : 0.35 }}
                                    />
                                ))}
                            </div>
                            {isStrict ? (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {!strictAudioStarted && !strictAudioEnded && (
                                        <button
                                            type="button"
                                            onClick={startStrictAudio}
                                            className="h-11 px-4 rounded-2xl bg-amber-500 text-void font-black flex items-center gap-2"
                                        >
                                            <Play size={18} /> Iniciar audio
                                        </button>
                                    )}
                                    <div className="h-11 px-4 rounded-2xl bg-void border border-border-subtle text-text-dim flex items-center gap-2 text-sm">
                                        {strictAudioEnded ? "Audio finalizado" : "Sin pausa, velocidad ni retroceso"}
                                    </div>
                                    <span className="text-xs text-text-dim ml-auto">
                                        {formatTime(Math.floor((audioProgress / 100) * audioDuration))} / {formatTime(Math.floor(audioDuration || 0))}
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleAudio}
                                        className="h-11 px-4 rounded-2xl bg-amber-500 text-void font-black flex items-center gap-2"
                                    >
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                        {isPlaying ? "Pausar" : "Reproducir"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={rewindAudio}
                                        className="h-11 px-3 rounded-2xl bg-void border border-border-subtle text-text-dim hover:text-white flex items-center gap-2"
                                    >
                                        <RotateCcw size={16} />
                                        5s
                                    </button>
                                    <div className="h-11 rounded-2xl bg-void border border-border-subtle px-2 flex items-center gap-1">
                                        <Gauge size={15} className="text-text-dim ml-1" />
                                        {PLAYBACK_RATES.map((rate) => (
                                            <button
                                                key={rate}
                                                type="button"
                                                onClick={() => changePlaybackRate(rate)}
                                                className={`h-8 px-2 rounded-xl text-xs font-bold transition-colors ${
                                                    playbackRate === rate ? "bg-amber-500 text-void" : "text-text-dim hover:text-white"
                                                }`}
                                            >
                                                {rate}x
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs text-text-dim ml-auto">
                                        {formatTime(Math.floor((audioProgress / 100) * audioDuration))} / {formatTime(Math.floor(audioDuration || 0))}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
                            Esta práctica todavía no tiene un audio configurado.
                        </div>
                    )}
                </section>
            )}

            <div className={exam.passage_text ? "grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start" : ""}>
                {exam.passage_text && (
                    <section className="bg-void/60 border border-border-subtle rounded-3xl p-5 max-h-[360px] overflow-y-auto lg:sticky lg:top-4 lg:max-h-[calc(100vh-10rem)]">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim mb-3">Texto de referencia</h2>
                        <p className="text-sm leading-7 text-zinc-200">{exam.passage_text}</p>
                    </section>
                )}

                <section className="bg-stone-surface border border-border-subtle rounded-3xl p-5">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                            Pregunta {currentIndex + 1} / {questions.length}
                        </span>
                        <span className="text-xs font-bold text-accent-focus bg-accent-focus/10 px-2 py-1 rounded-lg">
                            {currentQuestion.points_weight} pt
                        </span>
                    </div>

                    <h2 className="text-lg font-black text-white leading-snug mb-5">{currentQuestion.question_text}</h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                            const selected = answers[currentQuestion.id] === option.id;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))}
                                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                                        selected
                                            ? "border-accent-focus bg-accent-focus/12 text-white"
                                            : "border-border-subtle bg-void/40 text-text-dim hover:text-white hover:border-white/20"
                                    }`}
                                >
                                    <span className="text-sm font-semibold leading-relaxed">{optionLabel(option)}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    {error}
                </div>
            )}

            <footer className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                    disabled={currentIndex === 0 || isStrict}
                    className="h-12 px-4 rounded-2xl bg-stone-surface border border-border-subtle text-text-dim disabled:opacity-40 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                {currentIndex < questions.length - 1 ? (
                    <button
                        type="button"
                        onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                        className="flex-1 h-12 rounded-2xl bg-accent-focus text-white font-bold flex items-center justify-center gap-2"
                    >
                        Siguiente <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 h-12 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : answeredCount === questions.length ? <CheckCircle2 size={18} /> : <Send size={18} />}
                        {isStrict && submitting ? "Cerrando simulacro" : "Enviar práctica"}
                    </button>
                )}
            </footer>
        </div>
    );
}
