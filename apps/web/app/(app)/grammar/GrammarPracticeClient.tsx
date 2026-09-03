"use client";

import {
    buildGrammarQueue,
    evaluateGrammarReview,
    grammarProgressLabel,
    type GrammarDomain,
    type GrammarExercise,
    type GrammarOptionId,
    type GrammarProgress,
    type GrammarQueueItem,
    type GrammarSkill,
} from "@macitta/shared";
import {
    ArrowLeft,
    ArrowRight,
    BookCheck,
    Check,
    CheckCircle2,
    CloudOff,
    GraduationCap,
    Loader2,
    Play,
    RotateCcw,
    Sparkles,
    Target,
    Trophy,
    X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSync } from "@/hooks/useSync";
import {
    abandonGrammarSession,
    finishGrammarSession,
    loadGrammarData,
    recordGrammarAnswer,
    startGrammarSession,
    type GrammarDataSnapshot,
} from "@/lib/grammarService";
import type { LocalGrammarSession } from "@/lib/db";
import { createClient } from "@/utils/supabase/client";

type Screen = "home" | "practice" | "summary" | "completed";

interface SessionOutcome {
    exercise: GrammarExercise;
    selected: GrammarOptionId;
    correct: boolean;
    responseMs: number;
}

const EMPTY_DATA: GrammarDataSnapshot = {
    domains: [],
    skills: [],
    exercises: [],
    progress: [],
    source: "cache",
};

function formatDueDate(value: string) {
    const date = new Date(value);
    const today = new Date();
    if (date.getTime() <= today.getTime()) return "Toca repasar";
    return `Repaso ${new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(date)}`;
}

function progressCopy(progress: GrammarProgress) {
    const label = grammarProgressLabel(progress.step);
    if (label === "mastered") return "Dominado";
    if (label === "completed") return "Completado";
    if (label === "learning") return "Aprendiendo";
    return "Nuevo";
}

function optionText(exercise: GrammarExercise, optionId: GrammarOptionId) {
    if (exercise.prompt.kind === "sentence_completion") {
        return exercise.prompt.options.find((option) => option.id === optionId)?.text ?? optionId;
    }
    return exercise.prompt.segments.find((segment) => segment.optionId === optionId)?.text ?? optionId;
}

function ModuleHeader({ onBack }: { onBack?: () => void }) {
    return (
        <header className="flex min-h-12 items-center justify-between gap-4 pt-1 sm:pt-3">
            {onBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
                >
                    <ArrowLeft size={18} aria-hidden="true" /> Volver
                </button>
            ) : (
                <Link href="/dashboard" className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl" aria-label="Macitta, inicio">
                    macitta<span className="text-accent">.</span>
                </Link>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-bold text-ink-muted">
                <GraduationCap size={15} className="text-accent" aria-hidden="true" /> Grammar
            </span>
        </header>
    );
}

function CompletionQuestion({
    exercise,
    selected,
    locked,
    onSelect,
}: {
    exercise: GrammarExercise;
    selected: GrammarOptionId | null;
    locked: boolean;
    onSelect: (option: GrammarOptionId) => void;
}) {
    if (exercise.prompt.kind !== "sentence_completion") return null;
    return (
        <>
            <p className="text-center text-xl font-semibold leading-9 tracking-[-0.015em] text-ink sm:text-2xl sm:leading-10">
                {exercise.prompt.before}
                <span className="mx-1 inline-block min-w-20 border-b-2 border-accent/55 px-2 text-accent-hover" aria-label="espacio en blanco">
                    {locked
                        ? optionText(exercise, exercise.correct_option_id) === "—"
                            ? "\u00a0"
                            : optionText(exercise, exercise.correct_option_id)
                        : "_______"}
                </span>
                {exercise.prompt.after}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Opciones de respuesta">
                {exercise.prompt.options.map((option) => {
                    const isSelected = selected === option.id;
                    const isCorrect = locked && option.id === exercise.correct_option_id;
                    const isWrong = locked && isSelected && !isCorrect;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={locked}
                            onClick={() => onSelect(option.id)}
                            className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-[border-color,background-color,transform] active:scale-[0.99] ${
                                isCorrect
                                    ? "border-success/60 bg-success/10 text-ink"
                                    : isWrong
                                        ? "border-danger/60 bg-danger/10 text-ink"
                                        : isSelected
                                            ? "border-accent/70 bg-accent/10 text-ink"
                                            : "border-border-strong bg-surface/75 text-ink-muted hover:border-accent/40 hover:text-ink"
                            }`}
                        >
                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                isCorrect ? "bg-success text-void" : isWrong ? "bg-danger text-void" : "bg-white/6 text-ink-muted"
                            }`}>
                                {option.id}
                            </span>
                            <span className="font-semibold leading-6">{option.text}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

function ErrorIdentificationQuestion({
    exercise,
    selected,
    locked,
    onSelect,
}: {
    exercise: GrammarExercise;
    selected: GrammarOptionId | null;
    locked: boolean;
    onSelect: (option: GrammarOptionId) => void;
}) {
    if (exercise.prompt.kind !== "error_identification") return null;
    return (
        <div className="text-center">
            <p className="mb-7 text-sm font-semibold text-ink-muted">Selecciona la parte que necesita cambiar</p>
            <div className="inline text-xl font-semibold leading-[3.25rem] tracking-[-0.012em] text-ink sm:text-2xl sm:leading-[3.6rem]">
                {exercise.prompt.segments.map((segment, index) => {
                    if (!segment.optionId) return <span key={`${segment.text}-${index}`}>{segment.text}</span>;
                    const isSelected = selected === segment.optionId;
                    const isCorrect = locked && segment.optionId === exercise.correct_option_id;
                    const isWrong = locked && isSelected && !isCorrect;
                    return (
                        <button
                            key={`${segment.optionId}-${index}`}
                            type="button"
                            disabled={locked}
                            onClick={() => onSelect(segment.optionId!)}
                            aria-label={`Opción ${segment.optionId}: ${segment.text.trim()}`}
                            aria-pressed={isSelected}
                            className={`relative mx-0.5 inline-flex min-h-11 items-center rounded-lg border-b-2 px-1.5 transition-colors ${
                                isCorrect
                                    ? "border-success bg-success/10 text-success"
                                    : isWrong
                                        ? "border-danger bg-danger/10 text-danger"
                                        : isSelected
                                            ? "border-accent bg-accent/10 text-accent-hover"
                                            : "border-ink-faint/55 hover:border-accent hover:bg-white/5"
                            }`}
                        >
                            {segment.text}
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] font-black leading-none text-ink-faint" aria-hidden="true">
                                {segment.optionId}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FeedbackPanel({
    exercise,
    selected,
    correct,
}: {
    exercise: GrammarExercise;
    selected: GrammarOptionId;
    correct: boolean;
}) {
    const misconception = exercise.prompt.kind === "sentence_completion"
        ? exercise.prompt.options.find((option) => option.id === selected)?.feedback
        : undefined;
    return (
        <section
            aria-live="polite"
            className={`mt-7 rounded-2xl border p-5 sm:p-6 ${
                correct ? "border-success/30 bg-success/8" : "border-danger/30 bg-danger/8"
            }`}
        >
            <div className="flex items-center gap-3">
                <span className={`flex size-9 items-center justify-center rounded-full ${correct ? "bg-success text-void" : "bg-danger text-void"}`}>
                    {correct ? <Check size={19} strokeWidth={3} /> : <X size={19} strokeWidth={3} />}
                </span>
                <div>
                    <h2 className="font-black text-ink">{correct ? "Bien resuelto" : "Aquí estaba el detalle"}</h2>
                    {!correct && (
                        <p className="mt-0.5 text-xs text-ink-muted">
                            La respuesta correcta es {exercise.correct_option_id}: {optionText(exercise, exercise.correct_option_id).trim()}
                        </p>
                    )}
                </div>
            </div>
            <div className="mt-5 border-t border-white/8 pt-5">
                <p className="section-label">Oración correcta</p>
                <p className="mt-2 text-base font-semibold leading-7 text-ink">{exercise.corrected_sentence}</p>
                <p className="mt-4 text-sm leading-6 text-ink-muted">{exercise.explanation_es}</p>
                {!correct && misconception && (
                    <p className="mt-3 rounded-xl bg-void/35 px-4 py-3 text-sm leading-6 text-ink-muted">{misconception}</p>
                )}
            </div>
        </section>
    );
}

interface GrammarPracticeClientProps {
    previewData?: GrammarDataSnapshot;
    previewUserId?: string;
}

export function GrammarPracticeClient({ previewData, previewUserId }: GrammarPracticeClientProps = {}) {
    const isPreview = Boolean(previewData && previewUserId);
    const supabase = useMemo(() => createClient(), []);
    const { isOnline } = useNetworkStatus();
    const { performSync } = useSync();
    const [userId, setUserId] = useState<string | null>(previewUserId ?? null);
    const [data, setData] = useState<GrammarDataSnapshot>(previewData ?? EMPTY_DATA);
    const [loading, setLoading] = useState(!isPreview);
    const [error, setError] = useState<string | null>(null);
    const [screen, setScreen] = useState<Screen>("home");
    const [queue, setQueue] = useState<GrammarQueueItem[]>([]);
    const [session, setSession] = useState<LocalGrammarSession | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selected, setSelected] = useState<GrammarOptionId | null>(null);
    const [locked, setLocked] = useState(false);
    const [outcomes, setOutcomes] = useState<SessionOutcome[]>([]);
    const [sessionNumber, setSessionNumber] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const questionStartedAt = useRef(Date.now());

    const refreshData = useCallback(async () => {
        if (isPreview) return;
        setLoading(true);
        setError(null);
        try {
            const { data: authData } = await supabase.auth.getSession();
            const id = authData.session?.user.id;
            if (!id) throw new Error("No encontramos una sesión activa.");
            setUserId(id);
            const snapshot = await loadGrammarData(supabase, id, isOnline);
            setData(snapshot);
        } catch (loadError) {
            console.error(
                `[grammar-load:client] ${loadError instanceof Error ? loadError.name : "unknown"}`,
            );
            setError(loadError instanceof Error ? loadError.message : "No se pudo preparar Grammar.");
        } finally {
            setLoading(false);
        }
    }, [isOnline, isPreview, supabase]);

    useEffect(() => {
        void refreshData();
    }, [refreshData]);

    const progressByExercise = useMemo(
        () => new Map(data.progress.map((item) => [item.exerciseId, item])),
        [data.progress],
    );
    const skillById = useMemo(
        () => new Map(data.skills.map((skill) => [skill.id, skill])),
        [data.skills],
    );
    const domainById = useMemo(
        () => new Map(data.domains.map((domain) => [domain.id, domain])),
        [data.domains],
    );
    const nowMs = Date.now();
    const dueCount = data.progress.filter((item) => new Date(item.dueDate).getTime() <= nowMs).length;
    const completedCount = data.progress.filter((item) => item.step >= 2).length;
    const masteredCount = data.progress.filter((item) => item.step >= 8).length;
    const current = queue[questionIndex];

    const beginSession = useCallback(async () => {
        if (!userId) return;
        const nextQueue = buildGrammarQueue(
            data.exercises.map((exercise) => ({
                exercise,
                progress: progressByExercise.get(exercise.id),
            })),
            { userId, sessionNumber, size: 5 },
        );
        if (nextQueue.length === 0) {
            setError("No hay ejercicios nuevos o vencidos en este momento.");
            return;
        }
        const nextSession = isPreview
            ? {
                id: crypto.randomUUID(),
                userId,
                mode: "general" as const,
                focusedSkillId: null,
                status: "active" as const,
                startedAt: new Date().toISOString(),
                endedAt: null,
                totalExercises: 0,
                correctExercises: 0,
                totalTimeMs: 0,
            }
            : await startGrammarSession(userId);
        setSession(nextSession);
        setQueue(nextQueue);
        setQuestionIndex(0);
        setSelected(null);
        setLocked(false);
        setOutcomes([]);
        setScreen("practice");
        questionStartedAt.current = Date.now();
        if (isOnline && !isPreview) void performSync();
    }, [data.exercises, isOnline, isPreview, performSync, progressByExercise, sessionNumber, userId]);

    const submitAnswer = useCallback(async (optionId: GrammarOptionId) => {
        if (!current || !session || !userId || locked || submitting) return;
        setSelected(optionId);
        setSubmitting(true);
        const responseMs = Date.now() - questionStartedAt.current;
        try {
            const correct = optionId === current.exercise.correct_option_id;
            const result = isPreview
                ? {
                    progress: {
                        ...evaluateGrammarReview(current.progress, correct).nextState,
                        userId,
                        exerciseId: current.exercise.id,
                        firstSeenAt: current.progress.firstSeenAt ?? new Date().toISOString(),
                        correctAttempts: current.progress.correctAttempts + (correct ? 1 : 0),
                        totalAttempts: current.progress.totalAttempts + 1,
                        revision: current.progress.revision + 1,
                    },
                }
                : await recordGrammarAnswer({
                    userId,
                    sessionId: session.id,
                    exercise: current.exercise,
                    progress: current.progress,
                    selectedOptionId: optionId,
                    responseMs,
                });
            setQueue((items) => items.map((item, index) =>
                index === questionIndex ? { ...item, progress: result.progress } : item
            ));
            setData((snapshot) => ({
                ...snapshot,
                progress: [
                    ...snapshot.progress.filter((item) => item.exerciseId !== result.progress.exerciseId),
                    result.progress,
                ],
            }));
            setOutcomes((items) => [...items, {
                exercise: current.exercise,
                selected: optionId,
                correct,
                responseMs,
            }]);
            setLocked(true);
            if (isOnline && !isPreview) void performSync();
        } catch {
            setSelected(null);
            setError("No pudimos guardar esta respuesta. Inténtalo de nuevo.");
        } finally {
            setSubmitting(false);
        }
    }, [current, isOnline, isPreview, locked, performSync, questionIndex, session, submitting, userId]);

    useEffect(() => {
        if (screen !== "practice" || locked || !current) return;
        const onKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toUpperCase();
            if (["A", "B", "C", "D"].includes(key)) {
                event.preventDefault();
                void submitAnswer(key as GrammarOptionId);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [current, locked, screen, submitAnswer]);

    const continueSession = useCallback(async () => {
        if (!session) return;
        if (questionIndex < queue.length - 1) {
            setQuestionIndex((index) => index + 1);
            setSelected(null);
            setLocked(false);
            questionStartedAt.current = Date.now();
            return;
        }
        const totalTime = outcomes.reduce((sum, outcome) => sum + outcome.responseMs, 0);
        const correct = outcomes.filter((outcome) => outcome.correct).length;
        if (!isPreview) {
            await finishGrammarSession(session, outcomes.length, correct, totalTime);
        }
        setSessionNumber((number) => number + 1);
        setScreen("summary");
        if (isOnline && !isPreview) void performSync();
    }, [isOnline, isPreview, outcomes, performSync, questionIndex, queue.length, session]);

    const leavePractice = useCallback(async () => {
        if (session && !isPreview) {
            const totalTime = outcomes.reduce((sum, outcome) => sum + outcome.responseMs, 0);
            const correct = outcomes.filter((outcome) => outcome.correct).length;
            await abandonGrammarSession(session, outcomes.length, correct, totalTime);
            if (isOnline) void performSync();
        }
        setSession(null);
        setScreen("home");
    }, [isOnline, isPreview, outcomes, performSync, session]);

    if (loading) {
        return (
            <>
                <ModuleHeader />
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-ink-muted" role="status">
                    <Loader2 size={28} className="animate-spin text-accent" aria-hidden="true" />
                    <p className="text-sm font-semibold">Preparando tu repaso de Grammar…</p>
                </div>
            </>
        );
    }

    if (screen === "practice" && current) {
        const skill = skillById.get(current.exercise.primary_skill_id);
        return (
            <>
                <ModuleHeader onBack={() => void leavePractice()} />
                <main className="mx-auto w-full max-w-3xl pb-8">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/7" aria-label={`Ejercicio ${questionIndex + 1} de ${queue.length}`}>
                            <div
                                className="h-full rounded-full bg-accent transition-[width] duration-300"
                                style={{ width: `${((questionIndex + 1) / queue.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-black tabular-nums text-ink-muted">{questionIndex + 1}/{queue.length}</span>
                    </div>

                    <article className="product-panel rounded-3xl p-5 sm:p-8">
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                            <span className="pill-badge bg-accent/10 text-accent-hover">
                                {current.exercise.format === "sentence_completion" ? "Completa la oración" : "Encuentra el error"}
                            </span>
                            <span className="text-xs font-semibold text-ink-faint">{skill?.name_es ?? current.exercise.skill_code}</span>
                        </div>

                        <CompletionQuestion
                            exercise={current.exercise}
                            selected={selected}
                            locked={locked}
                            onSelect={submitAnswer}
                        />
                        <ErrorIdentificationQuestion
                            exercise={current.exercise}
                            selected={selected}
                            locked={locked}
                            onSelect={submitAnswer}
                        />

                        {locked && selected && (
                            <FeedbackPanel
                                exercise={current.exercise}
                                selected={selected}
                                correct={selected === current.exercise.correct_option_id}
                            />
                        )}

                        {locked && (
                            <button
                                type="button"
                                onClick={continueSession}
                                className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 font-black text-void transition-[background-color,transform] hover:bg-accent-hover active:scale-[0.99]"
                            >
                                {questionIndex === queue.length - 1 ? "Ver resumen" : "Siguiente ejercicio"}
                                <ArrowRight size={18} aria-hidden="true" />
                            </button>
                        )}
                    </article>
                    <p className="mt-4 text-center text-xs text-ink-faint">También puedes responder con las teclas A, B, C o D.</p>
                </main>
            </>
        );
    }

    if (screen === "summary") {
        const correct = outcomes.filter((outcome) => outcome.correct).length;
        return (
            <>
                <ModuleHeader onBack={() => setScreen("home")} />
                <main className="mx-auto w-full max-w-2xl pb-10">
                    <section className="product-panel overflow-hidden rounded-3xl">
                        <div className="border-b border-border bg-[radial-gradient(circle_at_50%_0%,rgba(124,133,232,0.18),transparent_62%)] px-6 py-10 text-center sm:px-10">
                            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                                <Sparkles size={27} aria-hidden="true" />
                            </span>
                            <p className="mt-5 text-sm font-bold text-accent-hover">Grupo terminado</p>
                            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-ink">{correct} de {outcomes.length}</h1>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-muted">
                                Cada respuesta ya ajustó tu siguiente repaso. Corregir después del feedback no suma una revisión extra.
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {outcomes.map((outcome, index) => (
                                <div key={outcome.exercise.id} className="flex items-center gap-4 px-5 py-4 sm:px-7">
                                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${outcome.correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                                        {outcome.correct ? <Check size={16} /> : <X size={16} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-xs font-bold text-ink-faint">Ejercicio {index + 1}</span>
                                        <span className="mt-0.5 block truncate text-sm font-semibold text-ink">{outcome.exercise.corrected_sentence}</span>
                                    </span>
                                    <span className="text-xs tabular-nums text-ink-faint">{Math.max(1, Math.round(outcome.responseMs / 1000))}s</span>
                                </div>
                            ))}
                        </div>
                    </section>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setScreen("home")}
                            className="inline-flex min-h-14 items-center justify-center rounded-xl border border-border-strong px-5 font-bold text-ink-muted hover:border-accent/40 hover:text-ink"
                        >
                            Volver a Grammar
                        </button>
                        <button
                            type="button"
                            onClick={beginSession}
                            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-black text-void hover:bg-accent-hover"
                        >
                            Otros 5 <RotateCcw size={18} aria-hidden="true" />
                        </button>
                    </div>
                </main>
            </>
        );
    }

    if (screen === "completed") {
        const completed = data.progress
            .filter((item) => item.step >= 2)
            .sort((left, right) => right.step - left.step);
        return (
            <>
                <ModuleHeader onBack={() => setScreen("home")} />
                <main className="pb-10">
                    <div className="mb-6">
                        <p className="text-sm font-bold text-accent-hover">Tu archivo vivo</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-ink">Ejercicios completados</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
                            Completado significa que ya lo resolviste bien en repasos espaciados. Puede volver cuando toque mantenimiento.
                        </p>
                    </div>
                    {completed.length === 0 ? (
                        <div className="product-panel rounded-2xl p-8 text-center text-sm text-ink-muted">
                            Tus primeros ejercicios aparecerán aquí después de dos repasos correctos y separados.
                        </div>
                    ) : (
                        <div className="product-panel divide-y divide-border overflow-hidden rounded-2xl">
                            {completed.map((item) => {
                                const exercise = data.exercises.find((candidate) => candidate.id === item.exerciseId);
                                if (!exercise) return null;
                                const skill = skillById.get(exercise.primary_skill_id);
                                return (
                                    <article key={item.exerciseId} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.step >= 8 ? "bg-amber/12 text-amber" : "bg-success/12 text-success"}`}>
                                            {item.step >= 8 ? <Trophy size={19} /> : <BookCheck size={19} />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-sm font-bold text-ink">{skill?.name_es}</h2>
                                            <p className="mt-1 truncate text-xs text-ink-muted">{exercise.corrected_sentence}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-ink">{progressCopy(item)}</p>
                                            <p className={`mt-1 text-[0.6875rem] ${new Date(item.dueDate).getTime() <= Date.now() ? "text-amber" : "text-ink-faint"}`}>{formatDueDate(item.dueDate)}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </>
        );
    }

    return (
        <>
            <ModuleHeader />
            <main className="mx-auto w-full max-w-2xl pb-12 pt-10 sm:pt-16">
                <section>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                        <span>Grammar</span>
                        <span aria-hidden="true">·</span>
                        <span>5 ejercicios</span>
                        {!isOnline && <><span aria-hidden="true">·</span><CloudOff size={14} /><span>Disponible offline</span></>}
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">Tu siguiente sesión está lista.</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">Repasaremos primero lo que más necesitas y completaremos el grupo con contenido nuevo.</p>
                    <button
                        type="button"
                        onClick={beginSession}
                        disabled={!userId || data.exercises.length === 0}
                        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-black text-void transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-48"
                    >
                        <Play size={18} fill="currentColor" aria-hidden="true" /> Estudiar 5
                    </button>
                </section>

                {error && (
                    <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-danger/30 bg-danger/8 p-4" role="alert">
                        <p className="text-sm leading-6 text-ink-muted">{error}</p>
                        <button type="button" onClick={() => setError(null)} className="shrink-0 text-ink-faint hover:text-ink" aria-label="Cerrar aviso"><X size={18} /></button>
                    </div>
                )}

                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5 text-sm text-ink-faint">
                    <span>{dueCount} por repasar</span>
                    <span>{completedCount} completados</span>
                    <span>{masteredCount} dominados</span>
                    <button type="button" onClick={() => setScreen("completed")} className="font-bold text-ink-muted hover:text-ink">Ver progreso</button>
                </div>
            </main>
        </>
    );
}
