"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateTOEFLScore } from "@maccita/shared";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import type { TOEFLAnswerOption, TOEFLExam, TOEFLQuestion } from "@/types/models";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2, Send } from "lucide-react";
import Link from "next/link";

interface TOEFLPracticeClientProps {
    userId: string;
    exam: TOEFLExam;
    questions: TOEFLQuestion[];
}

function optionLabel(option: TOEFLAnswerOption) {
    return `${option.id}) ${option.text}`;
}

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TOEFLPracticeClient({ userId, exam, questions }: TOEFLPracticeClientProps) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [startedAt] = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [startedAt]);

    async function handleSubmit() {
        if (submitting || questions.length === 0) return;

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
            mode: "flexible" as const,
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
                            <p className="text-[11px] uppercase tracking-wider text-accent-focus font-bold">{exam.section} · flexible</p>
                            <h1 className="text-xl font-black text-white leading-tight mt-1">{exam.title}</h1>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-dim bg-void rounded-full px-3 py-1.5 border border-border-subtle">
                            <Clock size={13} />
                            {formatTime(elapsedSeconds)}
                        </div>
                    </div>
                    <div className="h-2 rounded-full bg-void overflow-hidden">
                        <div className="h-full bg-accent-focus transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-text-dim mt-2">{answeredCount} de {questions.length} respondidas</p>
                </div>
            </header>

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
                    disabled={currentIndex === 0}
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
                        Enviar práctica
                    </button>
                )}
            </footer>
        </div>
    );
}
