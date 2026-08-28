"use client";

import {
    buildReadingQueue,
    createEmptyReadingQuestionProgress,
    createEmptyReadingSkillProgress,
    evaluateReadingAnswer,
    findResumableLongReading,
    readingParagraphs,
    type ReadingOptionId,
    type ReadingPassage,
    type ReadingQuestion,
    type ReadingQuestionProgress,
    type ReadingQueueItem,
    type ReadingSkillProgress,
} from "@macitta/shared";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    CheckCircle2,
    CloudOff,
    Eye,
    GraduationCap,
    LibraryBig,
    Loader2,
    LockKeyhole,
    RotateCcw,
    Sparkles,
    Trophy,
    X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSync } from "@/hooks/useSync";
import type { LocalReadingSession } from "@/lib/db";
import {
    abandonReadingSession,
    finishReadingSession,
    loadReadingData,
    recordReadingAnswer,
    recordReadingPassageExposure,
    startReadingSession,
    type ReadingDataSnapshot,
} from "@/lib/readingService";
import { createClient } from "@/utils/supabase/client";

type Screen = "home" | "practice" | "summary" | "completed";
type SessionMode = LocalReadingSession["mode"];

interface SessionOutcome {
    item: ReadingQueueItem;
    selected: ReadingOptionId;
    correct: boolean;
    responseMs: number;
}

const EMPTY_DATA: ReadingDataSnapshot = {
    domains: [],
    skills: [],
    passages: [],
    questions: [],
    questionProgress: [],
    skillProgress: [],
    exposures: [],
    source: "cache",
};

const GENRE_LABELS: Record<ReadingPassage["genre"], string> = {
    natural_science: "Ciencias naturales",
    social_science: "Ciencias sociales",
    history: "Historia",
    arts: "Artes",
    technology: "Tecnología",
};

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
                <GraduationCap size={15} className="text-accent" aria-hidden="true" /> TOEFL ITP · Reading
            </span>
        </header>
    );
}

function ReadingText({
    passage,
    evidence,
}: {
    passage: ReadingPassage;
    evidence?: ReadingQuestion["evidence"];
}) {
    return (
        <article>
            <div className="mb-7 border-b border-border pb-5">
                <p className="mb-2 text-[0.6875rem] font-black uppercase tracking-[0.16em] text-accent">
                    {GENRE_LABELS[passage.genre]} · {passage.word_count} palabras
                </p>
                <h2 className="text-2xl font-black tracking-[-0.035em] text-ink sm:text-3xl">
                    {passage.title}
                </h2>
            </div>
            <div className="space-y-5 font-serif text-[1.0625rem] leading-8 text-ink/90">
                {readingParagraphs(passage).map((paragraph, index) => {
                    const quote = evidence?.paragraph === index + 1 ? evidence.quote : null;
                    if (!quote) return <p key={index}>{paragraph}</p>;
                    const start = paragraph.toLocaleLowerCase("en").indexOf(quote.toLocaleLowerCase("en"));
                    if (start < 0) return <p key={index}>{paragraph}</p>;
                    return (
                        <p key={index}>
                            {paragraph.slice(0, start)}
                            <mark className="rounded bg-amber/20 px-0.5 text-ink">
                                {paragraph.slice(start, start + quote.length)}
                            </mark>
                            {paragraph.slice(start + quote.length)}
                        </p>
                    );
                })}
            </div>
        </article>
    );
}

function QuestionPanel({
    item,
    selected,
    locked,
    onSelect,
}: {
    item: ReadingQueueItem;
    selected: ReadingOptionId | null;
    locked: boolean;
    onSelect: (option: ReadingOptionId) => void;
}) {
    const { question } = item;
    return (
        <>
            <div className="mb-6">
                <p className="mb-3 text-[0.6875rem] font-black uppercase tracking-[0.16em] text-ink-faint">
                    {item.reason === "recovery" ? "Recuperación" : item.reason === "weak_skill" ? "Habilidad prioritaria" : item.reason === "continued_reading" ? "Continuación" : "Comprensión"}
                </p>
                <h3 className="text-xl font-bold leading-8 tracking-[-0.02em] text-ink">
                    {question.prompt}
                </h3>
            </div>
            <div className="grid gap-3" role="radiogroup" aria-label="Opciones de respuesta">
                {question.options.map((option) => {
                    const isSelected = selected === option.id;
                    const isCorrect = locked && option.id === question.correct_option_id;
                    const isWrong = locked && isSelected && !isCorrect;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={locked}
                            onClick={() => onSelect(option.id)}
                            className={`flex min-h-16 items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-[border-color,background-color,transform] active:scale-[0.99] ${
                                isCorrect
                                    ? "border-success/60 bg-success/10 text-ink"
                                    : isWrong
                                        ? "border-danger/60 bg-danger/10 text-ink"
                                        : isSelected
                                            ? "border-accent/70 bg-accent/10 text-ink"
                                            : "border-border-strong bg-surface/70 text-ink-muted hover:border-accent/40 hover:text-ink"
                            }`}
                        >
                            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                isCorrect ? "bg-success text-void" : isWrong ? "bg-danger text-void" : "bg-white/6 text-ink-muted"
                            }`}>
                                {isCorrect ? <Check size={16} /> : isWrong ? <X size={16} /> : option.id}
                            </span>
                            <span className="font-semibold leading-6">{option.text}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}

interface ReadingPracticeClientProps {
    previewData?: ReadingDataSnapshot;
    previewUserId?: string;
}

export function ReadingPracticeClient({
    previewData,
    previewUserId,
}: ReadingPracticeClientProps = {}) {
    const isPreview = Boolean(previewData && previewUserId);
    const supabase = useMemo(() => createClient(), []);
    const { isOnline } = useNetworkStatus();
    const { performSync } = useSync(!isPreview);
    const [screen, setScreen] = useState<Screen>("home");
    const [data, setData] = useState<ReadingDataSnapshot>(previewData ?? EMPTY_DATA);
    const [userId, setUserId] = useState<string | null>(previewUserId ?? null);
    const [loading, setLoading] = useState(!isPreview);
    const [error, setError] = useState<string | null>(null);
    const [queue, setQueue] = useState<ReadingQueueItem[]>([]);
    const [position, setPosition] = useState(0);
    const [selected, setSelected] = useState<ReadingOptionId | null>(null);
    const [locked, setLocked] = useState(false);
    const [session, setSession] = useState<LocalReadingSession | null>(null);
    const [outcomes, setOutcomes] = useState<SessionOutcome[]>([]);
    const [showMobileText, setShowMobileText] = useState(false);
    const [starting, setStarting] = useState(false);
    const questionStartedAt = useRef(Date.now());

    const refresh = useCallback(async () => {
        if (isPreview) return;
        setLoading(true);
        setError(null);
        const { data: authData } = await supabase.auth.getUser();
        const id = authData.user?.id;
        if (!id) {
            setError("Tu sesión expiró. Vuelve a iniciar sesión.");
            setLoading(false);
            return;
        }
        setUserId(id);
        try {
            const snapshot = await loadReadingData(supabase, id, isOnline);
            setData(snapshot);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Reading.");
        } finally {
            setLoading(false);
        }
    }, [isOnline, isPreview, supabase]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const progressByQuestion = useMemo(
        () => new Map(data.questionProgress.map((progress) => [progress.questionId, progress])),
        [data.questionProgress],
    );
    const progressBySkill = useMemo(
        () => new Map(data.skillProgress.map((progress) => [progress.skillId, progress])),
        [data.skillProgress],
    );
    const passageById = useMemo(
        () => new Map(data.passages.map((passage) => [passage.id, passage])),
        [data.passages],
    );
    const skillById = useMemo(
        () => new Map(data.skills.map((skill) => [skill.id, skill])),
        [data.skills],
    );
    const current = queue[position];
    const currentOutcome = outcomes[position];

    const startPractice = useCallback(async (
        mode: SessionMode,
        preferredPassageId?: string,
        preferredBlockIndex?: 1 | 2,
    ) => {
        if (!userId || starting) return;
        setStarting(true);
        setError(null);
        try {
            const recentPassageIds = [...data.exposures]
                .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
                .slice(0, 4)
                .map((exposure) => exposure.passageId);
            const candidates = data.questions.flatMap((question) => {
                const passage = passageById.get(question.passage_id);
                if (!passage) return [];
                return [{
                    passage,
                    question,
                    questionProgress: progressByQuestion.get(question.id),
                    skillProgress: progressBySkill.get(question.primary_skill_id),
                }];
            });
            const nextQueue = buildReadingQueue(candidates, {
                userId,
                size: 5,
                sessionNumber: data.questionProgress.reduce((sum, item) => sum + item.attempts, 0),
                passageMode: mode === "long" ? "long" : mode === "continued" ? "any" : "daily",
                recentPassageIds,
                preferredPassageId,
                preferredBlockIndex,
            });
            if (nextQueue.length === 0) {
                setScreen("completed");
                return;
            }
            const primaryPassageId = nextQueue[0].passage.id;
            const startedAt = new Date().toISOString();
            const nextSession: LocalReadingSession = isPreview
                ? {
                    id: crypto.randomUUID(),
                    userId,
                    mode,
                    primaryPassageId,
                    status: "active",
                    startedAt,
                    endedAt: null,
                    totalQuestions: 0,
                    correctQuestions: 0,
                    totalTimeMs: 0,
                }
                : await startReadingSession(userId, mode, primaryPassageId);
            for (const passageId of new Set(nextQueue.map((item) => item.passage.id))) {
                const existing = data.exposures.find((item) => item.passageId === passageId);
                const exposure = isPreview
                    ? {
                        userId,
                        passageId,
                        lastSeenAt: startedAt,
                        exposureCount: (existing?.exposureCount ?? 0) + 1,
                    }
                    : await recordReadingPassageExposure(userId, passageId);
                setData((previous) => ({
                    ...previous,
                    exposures: [
                        ...previous.exposures.filter((item) => item.passageId !== passageId),
                        exposure,
                    ],
                }));
            }
            setSession(nextSession);
            setQueue(nextQueue);
            setPosition(0);
            setSelected(null);
            setLocked(false);
            setOutcomes([]);
            setShowMobileText(false);
            questionStartedAt.current = Date.now();
            setScreen("practice");
        } catch {
            setError("No pudimos iniciar este repaso. Inténtalo de nuevo.");
        } finally {
            setStarting(false);
        }
    }, [
        data.exposures,
        data.questionProgress,
        data.questions,
        isPreview,
        passageById,
        progressByQuestion,
        progressBySkill,
        starting,
        userId,
    ]);

    const selectAnswer = useCallback(async (option: ReadingOptionId) => {
        if (!current || !session || !userId || locked) return;
        setSelected(option);
        setLocked(true);
        const responseMs = Date.now() - questionStartedAt.current;
        const questionProgress = progressByQuestion.get(current.question.id)
            ?? createEmptyReadingQuestionProgress(userId, current.question.id);
        const skillProgress = progressBySkill.get(current.question.primary_skill_id)
            ?? createEmptyReadingSkillProgress(userId, current.question.primary_skill_id);
        const result = isPreview
            ? (() => {
                const evaluated = evaluateReadingAnswer(
                    questionProgress,
                    skillProgress,
                    option === current.question.correct_option_id,
                );
                return {
                    questionProgress: evaluated.questionProgress,
                    skillProgress: {
                        ...evaluated.skillTransition.nextState,
                        userId,
                        skillId: current.question.primary_skill_id,
                        correctAttempts: skillProgress.correctAttempts + (option === current.question.correct_option_id ? 1 : 0),
                        totalAttempts: skillProgress.totalAttempts + 1,
                        revision: skillProgress.revision + 1,
                    } satisfies ReadingSkillProgress,
                };
            })()
            : await recordReadingAnswer({
                userId,
                sessionId: session.id,
                question: current.question,
                questionProgress,
                skillProgress,
                selectedOptionId: option,
                responseMs,
            });
        const correct = option === current.question.correct_option_id;
        setData((previous) => ({
            ...previous,
            questionProgress: [
                ...previous.questionProgress.filter((item) => item.questionId !== result.questionProgress.questionId),
                result.questionProgress,
            ],
            skillProgress: [
                ...previous.skillProgress.filter((item) => item.skillId !== result.skillProgress.skillId),
                result.skillProgress,
            ],
        }));
        setOutcomes((previous) => [
            ...previous,
            { item: current, selected: option, correct, responseMs },
        ]);
        if (isOnline && !isPreview) void performSync();
    }, [current, isOnline, isPreview, locked, performSync, progressByQuestion, progressBySkill, session, userId]);

    useEffect(() => {
        if (screen !== "practice" || locked) return;
        const onKeyDown = (event: KeyboardEvent) => {
            const option = event.key.toUpperCase() as ReadingOptionId;
            if (["A", "B", "C", "D"].includes(option)) void selectAnswer(option);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [locked, screen, selectAnswer]);

    const finishCurrentSession = useCallback(async () => {
        if (!session) return;
        const correct = outcomes.filter((outcome) => outcome.correct).length;
        const totalMs = outcomes.reduce((sum, outcome) => sum + outcome.responseMs, 0);
        if (!isPreview) {
            await finishReadingSession(session, outcomes.length, correct, totalMs);
        }
        if (isOnline && !isPreview) void performSync();
        setScreen("summary");
    }, [isOnline, isPreview, outcomes, performSync, session]);

    const nextQuestion = useCallback(async () => {
        if (!locked) return;
        if (position >= queue.length - 1) {
            await finishCurrentSession();
            return;
        }
        setPosition((value) => value + 1);
        setSelected(null);
        setLocked(false);
        setShowMobileText(false);
        questionStartedAt.current = Date.now();
    }, [finishCurrentSession, locked, position, queue.length]);

    const leavePractice = useCallback(async () => {
        if (session && !isPreview) {
            const correct = outcomes.filter((outcome) => outcome.correct).length;
            const totalMs = outcomes.reduce((sum, outcome) => sum + outcome.responseMs, 0);
            await abandonReadingSession(session, outcomes.length, correct, totalMs);
        }
        setScreen("home");
    }, [isPreview, outcomes, session]);

    const completedCount = data.questionProgress.filter((item) => item.points === 2).length;
    const recoveringCount = data.questionProgress.filter((item) => item.attempts > 0 && item.points < 2).length;
    const dueRecoveryCount = data.questionProgress.filter(
        (item) =>
            item.attempts > 0 &&
            item.points < 2 &&
            new Date(item.dueAt).getTime() <= Date.now(),
    ).length;
    const resumableLongReading = useMemo(
        () => findResumableLongReading(
            data.passages,
            data.questions,
            data.questionProgress,
            data.exposures,
        ),
        [
            data.exposures,
            data.passages,
            data.questionProgress,
            data.questions,
        ],
    );

    if (loading) {
        return (
            <div className="mx-auto min-h-[70vh] max-w-6xl">
                <ModuleHeader />
                <div className="flex min-h-[55vh] items-center justify-center text-ink-muted">
                    <Loader2 className="mr-3 animate-spin text-accent" /> Preparando tus lecturas…
                </div>
            </div>
        );
    }

    if (screen === "practice" && current) {
        const skill = skillById.get(current.question.primary_skill_id);
        const evidence = locked ? current.question.evidence : undefined;
        const selectedRationale = selected && selected !== current.question.correct_option_id
            ? current.question.distractor_rationales[selected]
            : null;
        return (
            <div className="mx-auto max-w-6xl">
                <ModuleHeader onBack={() => void leavePractice()} />
                <div className="mt-5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
                        <div
                            className="h-full rounded-full bg-accent transition-[width] duration-300"
                            style={{ width: `${((position + (locked ? 1 : 0)) / queue.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-black tabular-nums text-ink-muted">{position + 1}/{queue.length}</span>
                </div>

                <button
                    type="button"
                    onClick={() => setShowMobileText((value) => !value)}
                    className="mt-5 flex min-h-12 w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 text-sm font-bold text-ink lg:hidden"
                >
                    <span className="inline-flex items-center gap-2"><Eye size={17} className="text-accent" /> {showMobileText ? "Ocultar lectura" : "Ver lectura"}</span>
                    <span className="text-xs text-ink-faint">{current.passage.title}</span>
                </button>

                <main className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
                    <section className={`${showMobileText ? "block" : "hidden"} rounded-3xl border border-border bg-surface/55 p-5 sm:p-8 lg:sticky lg:top-5 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto`}>
                        <ReadingText passage={current.passage} evidence={evidence} />
                    </section>
                    <section className="rounded-3xl border border-border bg-elevated p-5 shadow-2xl shadow-black/10 sm:p-7">
                        {skill && (
                            <div className="mb-6 inline-flex rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-ink-muted">
                                {skill.name_es}
                            </div>
                        )}
                        <QuestionPanel item={current} selected={selected} locked={locked} onSelect={(option) => void selectAnswer(option)} />
                        {locked && currentOutcome && (
                            <div className={`mt-6 rounded-2xl border p-4 ${currentOutcome.correct ? "border-success/35 bg-success/8" : "border-danger/35 bg-danger/8"}`}>
                                <div className="flex items-start gap-3">
                                    {currentOutcome.correct
                                        ? <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={20} />
                                        : <RotateCcw className="mt-0.5 shrink-0 text-danger" size={20} />}
                                    <div>
                                        <p className="font-black text-ink">{currentOutcome.correct ? "Correcto" : "Todavía no"}</p>
                                        <p className="mt-1 text-sm leading-6 text-ink-muted">{current.question.explanation_es}</p>
                                        {selectedRationale && (
                                            <p className="mt-3 border-t border-white/8 pt-3 text-sm leading-6 text-ink-muted">
                                                <span className="font-bold text-ink">Por qué no {selected}:</span> {selectedRationale}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowMobileText(true)}
                                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent lg:hidden"
                                        >
                                            <Eye size={15} /> Ver evidencia en el texto
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-7 flex items-center justify-between gap-4">
                            <span className="hidden text-xs text-ink-faint sm:block">También puedes responder con A–D</span>
                            <button
                                type="button"
                                disabled={!locked}
                                onClick={() => void nextQuestion()}
                                className="ml-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-black text-void transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                {position === queue.length - 1 ? "Ver resultados" : "Siguiente"} <ArrowRight size={17} />
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    if (screen === "summary") {
        const correct = outcomes.filter((outcome) => outcome.correct).length;
        const primaryPassage = session?.primaryPassageId ? passageById.get(session.primaryPassageId) : undefined;
        const finishedBlock = outcomes[0]?.item.question.block_index;
        const canContinueLong = primaryPassage?.length_band === "long" && finishedBlock === 1 &&
            data.questions.some((question) =>
                question.passage_id === primaryPassage.id &&
                question.block_index === 2 &&
                (progressByQuestion.get(question.id)?.attempts ?? 0) === 0
            );
        return (
            <div className="mx-auto max-w-3xl">
                <ModuleHeader />
                <main className="py-10 sm:py-16">
                    <div className="rounded-[2rem] border border-border bg-elevated p-6 text-center sm:p-10">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                            <Trophy size={30} />
                        </div>
                        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-accent">Bloque completado</p>
                        <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-ink">{correct} de {outcomes.length}</h1>
                        <p className="mx-auto mt-3 max-w-md leading-7 text-ink-muted">
                            {correct === outcomes.length
                                ? "Lectura limpia. Esas preguntas salen de tu cola y la habilidad seguirá creciendo con textos nuevos."
                                : "Los tropiezos quedan en recuperación. Volverán cuando toque, sin convertir la práctica en memorización."}
                        </p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {canContinueLong && primaryPassage ? (
                                <button
                                    type="button"
                                    onClick={() => void startPractice("continued", primaryPassage.id, 2)}
                                    disabled={starting}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-black text-void"
                                >
                                    {starting ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />}
                                    Continuar esta lectura
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => void startPractice("daily")}
                                    disabled={starting}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-black text-void"
                                >
                                    {starting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Otros 5
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setScreen("home")}
                                className="min-h-14 rounded-2xl border border-border-strong bg-surface px-5 font-black text-ink"
                            >
                                Volver a Reading
                            </button>
                        </div>
                        {canContinueLong && (
                            <p className="mt-4 inline-flex items-center gap-2 text-xs text-ink-faint">
                                <LockKeyhole size={13} /> El segundo bloque queda guardado si prefieres volver después.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    if (screen === "completed") {
        const completedItems = data.questionProgress
            .filter((progress) => progress.points === 2)
            .sort((left, right) => (right.lastAnsweredAt ?? "").localeCompare(left.lastAnsweredAt ?? ""))
            .flatMap((progress) => {
                const question = data.questions.find((item) => item.id === progress.questionId);
                if (!question) return [];
                const passage = passageById.get(question.passage_id);
                const skill = skillById.get(question.primary_skill_id);
                if (!passage || !skill) return [];
                return [{ progress, question, passage, skill }];
            });
        return (
            <div className="mx-auto max-w-3xl">
                <ModuleHeader onBack={() => setScreen("home")} />
                <main className="py-10 sm:py-14">
                    <div className="text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success"><CheckCircle2 size={30} /></div>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-success">2 de 2 puntos</p>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">Ejercicios limpios</h1>
                        <p className="mx-auto mt-3 max-w-lg leading-7 text-ink-muted">
                            Salieron de tu cola. La habilidad seguirá apareciendo en preguntas nuevas para comprobar transferencia, no memoria.
                        </p>
                    </div>
                    <div className="mt-9 space-y-3">
                        {completedItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border-strong p-7 text-center text-sm text-ink-muted">
                                Aún no hay ejercicios limpios. Una respuesta correcta al primer intento suma los dos puntos.
                            </div>
                        ) : completedItems.map(({ progress, question, passage, skill }) => (
                            <div key={question.id} className="rounded-2xl border border-border bg-surface/55 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.12em] text-ink-faint">{passage.title}</p>
                                        <p className="mt-2 font-bold leading-6 text-ink">{question.prompt}</p>
                                        <p className="mt-2 text-sm text-ink-muted">{skill.name_es}</p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-xs font-black text-success">
                                        <Check size={13} /> {progress.points}/2
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <button onClick={() => setScreen("home")} className="min-h-12 rounded-xl bg-accent px-6 font-black text-void">Volver a Reading</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <ModuleHeader />
            <main className="mx-auto w-full max-w-2xl pb-12 pt-10 sm:pt-16">
                <section>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                        <span>Reading</span><span aria-hidden="true">·</span><span>1 lectura, 5 preguntas</span>
                        {!isOnline && <><span aria-hidden="true">·</span><CloudOff size={14} /><span>Disponible offline</span></>}
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">Tu siguiente lectura está lista.</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">Elegiremos el texto y las habilidades que más te conviene practicar ahora.</p>
                    <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <button
                            type="button"
                            onClick={() => void startPractice(dueRecoveryCount > 0 ? "recovery" : "daily")}
                            disabled={starting || data.questions.length === 0}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-black text-void transition-colors hover:bg-accent-hover disabled:opacity-45 sm:w-auto sm:min-w-52"
                        >
                            {starting ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={19} />}
                            Estudiar lectura
                        </button>
                        <button
                            type="button"
                            onClick={() => resumableLongReading
                                ? void startPractice("continued", resumableLongReading.passageId, resumableLongReading.blockIndex)
                                : void startPractice("long")
                            }
                            disabled={starting || data.questions.length === 0}
                            className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-bold text-ink-muted hover:text-ink disabled:opacity-45"
                        >
                            <LibraryBig size={17} />
                            {resumableLongReading ? "Continuar lectura larga" : "Practicar lectura larga"}
                        </button>
                    </div>
                    {error && <p className="mt-5 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">{error}</p>}
                </section>
                <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5 text-sm text-ink-faint">
                    <span>{completedCount} completadas</span>
                    <span>{recoveringCount} por reforzar</span>
                    <button onClick={() => setScreen("completed")} className="font-bold text-ink-muted hover:text-ink">Ver progreso</button>
                </div>
            </main>
        </div>
    );
}
