"use client";

import {
    aggregateListeningProgress,
    buildListeningQueue,
    createEmptyListeningQuestionProgress,
    createEmptyListeningSkillProgress,
    evaluateListeningAnswer,
    type ListeningOptionId,
    type ListeningQueueItem,
} from "@macitta/shared";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronRight,
    CloudOff,
    Ear,
    Headphones,
    Lightbulb,
    Loader2,
    Play,
    RotateCcw,
    Sparkles,
    Trophy,
    Volume2,
    Waves,
    X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSync } from "@/hooks/useSync";
import type { LocalListeningSession } from "@/lib/db";
import {
    abandonListeningSession,
    finishListeningSession,
    loadListeningData,
    recordListeningAnswer,
    startListeningSession,
    type ListeningDataSnapshot,
} from "@/lib/listeningService";
import { createClient } from "@/utils/supabase/client";

type Screen = "home" | "practice" | "summary" | "completed";
type SessionMode = LocalListeningSession["mode"];

const EMPTY_DATA: ListeningDataSnapshot = {
    skills: [], units: [], questions: [], questionProgress: [], skillProgress: [], source: "cache",
};

function Header({ onBack }: { onBack?: () => void }) {
    return (
        <header className="flex min-h-12 items-center justify-between gap-4 pt-1 sm:pt-3">
            {onBack ? (
                <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-ink-muted hover:bg-white/5 hover:text-ink">
                    <ArrowLeft size={18} /> Volver
                </button>
            ) : (
                <Link href="/dashboard" className="text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl">macitta<span className="text-accent">.</span></Link>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-bold text-ink-muted">
                <Headphones size={15} className="text-accent" /> TOEFL ITP · Listening
            </span>
        </header>
    );
}

function OptionList({ item, selected, locked, onSelect }: {
    item: ListeningQueueItem;
    selected: ListeningOptionId | null;
    locked: boolean;
    onSelect: (option: ListeningOptionId) => void;
}) {
    return (
        <div className="grid gap-3" role="radiogroup" aria-label="Opciones de respuesta">
            {item.question.options.map((option) => {
                const correct = locked && option.id === item.question.correct_option_id;
                const wrong = locked && selected === option.id && !correct;
                const active = selected === option.id;
                return (
                    <button key={option.id} type="button" role="radio" aria-checked={active} disabled={locked}
                        onClick={() => onSelect(option.id)}
                        className={`flex min-h-16 items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99] ${
                            correct ? "border-success/60 bg-success/10 text-ink" : wrong ? "border-danger/60 bg-danger/10 text-ink" : active ? "border-accent/70 bg-accent/10 text-ink" : "border-border-strong bg-surface/70 text-ink-muted hover:border-accent/40 hover:text-ink"
                        }`}>
                        <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${correct ? "bg-success text-void" : wrong ? "bg-danger text-void" : "bg-white/6 text-ink-muted"}`}>
                            {correct ? <Check size={16} /> : wrong ? <X size={16} /> : option.id}
                        </span>
                        <span className="font-semibold leading-6">{option.text}</span>
                    </button>
                );
            })}
        </div>
    );
}

interface Props { previewData?: ListeningDataSnapshot; previewUserId?: string; }

export function ListeningPracticeClient({ previewData, previewUserId }: Props = {}) {
    const isPreview = Boolean(previewData && previewUserId);
    const supabase = useMemo(() => createClient(), []);
    const { isOnline } = useNetworkStatus();
    const { performSync } = useSync(!isPreview);
    const audioRef = useRef<HTMLAudioElement>(null);
    const startedAt = useRef(Date.now());
    const [screen, setScreen] = useState<Screen>("home");
    const [data, setData] = useState<ListeningDataSnapshot>(previewData ?? EMPTY_DATA);
    const [userId, setUserId] = useState<string | null>(previewUserId ?? null);
    const [loading, setLoading] = useState(!isPreview);
    const [error, setError] = useState<string | null>(null);
    const [starting, setStarting] = useState(false);
    const [queue, setQueue] = useState<ListeningQueueItem[]>([]);
    const [position, setPosition] = useState(0);
    const [session, setSession] = useState<LocalListeningSession | null>(null);
    const [selected, setSelected] = useState<ListeningOptionId | null>(null);
    const [locked, setLocked] = useState(false);
    const [heard, setHeard] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const [outcomes, setOutcomes] = useState<Array<{ item: ListeningQueueItem; selected: ListeningOptionId; correct: boolean; earnedPoints: number; responseMs: number }>>([]);

    const refresh = useCallback(async () => {
        if (isPreview) return;
        setLoading(true); setError(null);
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) { setError("Tu sesión expiró. Vuelve a iniciar sesión."); setLoading(false); return; }
        setUserId(auth.user.id);
        try { setData(await loadListeningData(supabase, auth.user.id, isOnline)); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar Listening."); }
        finally { setLoading(false); }
    }, [isOnline, isPreview, supabase]);

    useEffect(() => { void refresh(); }, [refresh]);

    const progressByQuestion = useMemo(() => new Map(data.questionProgress.map((item) => [item.questionId, item])), [data.questionProgress]);
    const progressBySkill = useMemo(() => new Map(data.skillProgress.map((item) => [item.skillCode, item])), [data.skillProgress]);
    const current = queue[position];
    const isLongFollowUp = Boolean(current && position > 0 && queue[position - 1]?.unit.id === current.unit.id && current.unit.kind === "long");

    const startPractice = useCallback(async (mode: SessionMode) => {
        if (!userId || starting) return;
        setStarting(true); setError(null);
        try {
            const candidates = data.questions.flatMap((question) => {
                const unit = data.units.find((candidate) => candidate.id === question.unit_id);
                return unit ? [{ unit, question, progress: progressByQuestion.get(question.id), skillProgress: progressBySkill.get(question.primary_skill_code) }] : [];
            });
            const nextQueue = buildListeningQueue(candidates, {
                userId, mode, size: 5, sessionNumber: data.questionProgress.reduce((sum, item) => sum + item.attempts, 0),
                recentUnitIds: outcomes.map((outcome) => outcome.item.unit.id),
            });
            if (!nextQueue.length) { setScreen("completed"); return; }
            const nextSession = isPreview ? {
                id: crypto.randomUUID(), userId, mode, primaryUnitId: nextQueue[0].unit.id, status: "active" as const,
                startedAt: new Date().toISOString(), endedAt: null, totalQuestions: 0, correctQuestions: 0, totalTimeMs: 0,
            } : await startListeningSession(userId, mode, nextQueue[0].unit.id);
            setQueue(nextQueue); setSession(nextSession); setPosition(0); setSelected(null); setLocked(false); setHeard(false); setPlayCount(0); setOutcomes([]); startedAt.current = Date.now(); setScreen("practice");
        } catch { setError("No pudimos iniciar este audio. Inténtalo de nuevo."); }
        finally { setStarting(false); }
    }, [data.questionProgress, data.questions, data.units, isPreview, outcomes, progressByQuestion, progressBySkill, starting, userId]);

    const playAudio = useCallback(async () => {
        if (!audioRef.current || playCount >= 2 || locked) return;
        audioRef.current.currentTime = 0;
        try { await audioRef.current.play(); setPlayCount((count) => count + 1); }
        catch { setError("No pudimos reproducir el audio. Verifica tu conexión y vuelve a intentarlo."); }
    }, [locked, playCount]);

    const submit = useCallback(async (option: ListeningOptionId) => {
        if (!current || !session || !userId || locked || !heard) return;
        setSelected(option); setLocked(true);
        const questionProgress = progressByQuestion.get(current.question.id) ?? createEmptyListeningQuestionProgress(userId, current.question.id);
        const skillProgress = progressBySkill.get(current.question.primary_skill_code) ?? createEmptyListeningSkillProgress(userId, current.question.primary_skill_code);
        const correct = option === current.question.correct_option_id;
        const responseMs = Date.now() - startedAt.current;
        const result = isPreview ? (() => {
            const evaluated = evaluateListeningAnswer(questionProgress, skillProgress, correct, playCount);
            return { questionProgress: evaluated.questionProgress, skillProgress: evaluated.skillProgress, attempt: { earnedPoints: evaluated.earnedPoints } };
        })() : await recordListeningAnswer({ userId, sessionId: session.id, question: current.question, questionProgress, skillProgress, selectedOptionId: option, playCount, responseMs });
        setData((previous) => ({
            ...previous,
            questionProgress: [...previous.questionProgress.filter((item) => item.questionId !== current.question.id), result.questionProgress],
            skillProgress: [...previous.skillProgress.filter((item) => item.skillCode !== current.question.primary_skill_code), result.skillProgress],
        }));
        setOutcomes((previous) => [...previous, { item: current, selected: option, correct, earnedPoints: result.attempt.earnedPoints, responseMs }]);
        void performSync();
    }, [current, heard, isPreview, locked, performSync, playCount, progressByQuestion, progressBySkill, session, userId]);

    const next = useCallback(async () => {
        if (!session) return;
        if (position + 1 < queue.length) {
            const nextItem = queue[position + 1];
            const sameLong = nextItem.unit.id === current?.unit.id && nextItem.unit.kind === "long";
            setPosition((value) => value + 1); setSelected(null); setLocked(false); setHeard(sameLong); setPlayCount(sameLong ? 1 : 0); startedAt.current = Date.now();
            return;
        }
        const correct = outcomes.filter((outcome) => outcome.correct).length;
        const totalMs = Date.now() - new Date(session.startedAt).getTime();
        if (!isPreview) await finishListeningSession(session, outcomes.length, correct, totalMs);
        setScreen("summary"); void performSync();
    }, [current?.unit.id, isPreview, outcomes, performSync, position, queue, session]);

    const leave = useCallback(async () => {
        if (session && !isPreview) await abandonListeningSession(session, outcomes.length, outcomes.filter((item) => item.correct).length, Date.now() - new Date(session.startedAt).getTime());
        setScreen("home"); void performSync();
    }, [isPreview, outcomes, performSync, session]);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (!current || event.metaKey || event.ctrlKey || event.altKey) return;
            if (locked && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                void next();
                return;
            }
            if (!locked && heard) {
                const option = event.key.toUpperCase() as ListeningOptionId;
                if (["A", "B", "C", "D"].includes(option)) void submit(option);
            }
        };
        window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey);
    }, [current, heard, locked, next, submit]);

    const progress = useMemo(() => aggregateListeningProgress(data.questions, data.questionProgress), [data.questionProgress, data.questions]);

    if (loading) return <main className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center bg-void px-5 text-ink"><Loader2 className="animate-spin text-accent" /> <span className="ml-3 font-semibold">Afinando tu oído…</span></main>;
    if (error && !data.questions.length) return <main className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center bg-void px-5 text-center text-ink"><div><CloudOff className="mx-auto mb-4 text-danger" /><p>{error}</p><button className="mt-5 rounded-xl bg-accent px-5 py-3 font-black text-void" onClick={() => void refresh()}>Reintentar</button></div></main>;

    if (screen === "practice" && current) {
        const canReplay = heard && playCount < 2 && !locked;
        return <main className="mx-auto min-h-dvh w-full max-w-6xl bg-void px-5 pb-24 sm:px-8 lg:px-10">
            <Header onBack={() => void leave()} />
            <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 sm:p-9">
                    <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-accent/10 blur-3xl" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-accent">{current.unit.kind === "long" ? "Audio largo · 5 preguntas" : "Micro listening"}</p>
                            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">{current.unit.title}</h1>
                        </div>
                        <span className="rounded-full border border-border bg-void/60 px-3 py-1.5 text-xs font-black text-ink-muted">{position + 1} / {queue.length}</span>
                    </div>
                    <div className="relative mt-9 rounded-3xl border border-white/8 bg-void/65 p-5 sm:p-7">
                        <audio ref={audioRef} src={current.unit.audio_path} preload="auto" onEnded={() => { setHeard(true); startedAt.current = Date.now(); }} />
                        <div className="flex flex-col items-center text-center">
                            <div className={`flex size-20 items-center justify-center rounded-[1.6rem] border ${heard ? "border-success/40 bg-success/10 text-success" : "border-accent/35 bg-accent/10 text-accent"}`}>
                                {heard ? <Ear size={34} /> : <Volume2 size={34} />}
                            </div>
                            <p className="mt-5 text-lg font-black text-ink">{heard ? "Ahora responde sin buscar palabras sueltas." : "Escucha primero. La pregunta aparecerá al terminar."}</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">{current.unit.note_prompt_es}</p>
                            {!heard ? <button type="button" onClick={() => void playAudio()} disabled={playCount >= 2} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-accent px-6 font-black text-void shadow-[0_12px_34px_rgba(222,255,85,0.16)] transition hover:brightness-110 disabled:opacity-50"><Play size={18} fill="currentColor" /> {playCount ? "Reproduciendo otra vez" : "Reproducir audio"}</button> : null}
                            {canReplay ? <button type="button" onClick={() => void playAudio()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-ink-muted hover:bg-white/5 hover:text-ink"><RotateCcw size={16} /> Escuchar de nuevo <span className="text-amber">· máximo 1 punto</span></button> : null}
                            {heard && playCount >= 2 ? <p className="mt-4 text-xs font-bold text-ink-faint">Ya usaste la repetición de este audio.</p> : null}
                        </div>
                    </div>
                    {heard ? <div className="relative mt-8">
                        <p className="text-[0.6875rem] font-black uppercase tracking-[0.17em] text-ink-faint">{current.reason === "recovery" ? "Recuperación" : current.reason === "weak_ear" ? "Oído prioritario" : current.reason === "long_set" ? "Comprensión conectada" : "Escucha activa"}</p>
                        <h2 className="mt-3 text-xl font-bold leading-8 text-ink sm:text-2xl">{current.question.prompt}</h2>
                        <div className="mt-6"><OptionList item={current} selected={selected} locked={locked} onSelect={(option) => void submit(option)} /></div>
                        {locked ? <div className={`mt-6 rounded-2xl border p-5 ${selected === current.question.correct_option_id ? "border-success/35 bg-success/8" : "border-danger/35 bg-danger/8"}`}>
                            <div className="flex gap-3"><Lightbulb className="mt-0.5 shrink-0 text-amber" size={19} /><div><p className="font-black text-ink">{selected === current.question.correct_option_id ? (playCount <= 1 ? "Limpio: +2 puntos" : "Bien recuperado: +1 punto") : "Esta vuelve pronto"}</p><p className="mt-1 text-sm leading-6 text-ink-muted">{current.question.explanation_es}</p><p className="mt-3 text-xs font-bold text-ink-faint">Pista del audio: “{current.question.evidence}”</p></div></div>
                            <button type="button" onClick={() => void next()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/8 px-4 text-sm font-black text-ink hover:bg-white/12">{position + 1 === queue.length ? "Ver resumen" : "Siguiente"}<ArrowRight size={16} /></button>
                        </div> : null}
                    </div> : null}
                </section>
                <aside className="space-y-4">
                    <div className="rounded-3xl border border-border bg-surface/70 p-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">Regla de oro</p><p className="mt-3 font-bold leading-6 text-ink">No pauses para traducir. Busca intención, contraste y consecuencia.</p></div>
                    <div className="rounded-3xl border border-accent/20 bg-accent/6 p-5"><Waves className="text-accent" size={21} /><p className="mt-3 text-sm font-bold leading-6 text-ink">Una escucha limpia vale dos puntos. La repetición sirve para aprender, no para inflar progreso.</p></div>
                    {error ? <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">{error}</p> : null}
                </aside>
            </div>
        </main>;
    }

    if (screen === "summary") {
        const correct = outcomes.filter((item) => item.correct).length;
        const clean = outcomes.filter((item) => item.earnedPoints === 2).length;
        return <main className="mx-auto min-h-dvh w-full max-w-6xl bg-void px-5 pb-24 sm:px-8 lg:px-10"><Header onBack={() => setScreen("home")} /><section className="mx-auto mt-16 max-w-2xl text-center"><div className="mx-auto flex size-20 items-center justify-center rounded-[1.7rem] bg-accent/12 text-accent"><Trophy size={36} /></div><p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-accent">Listening terminado</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-ink sm:text-5xl">{correct} de {outcomes.length} entendidas.</h1><p className="mx-auto mt-5 max-w-lg leading-7 text-ink-muted">{clean} respuestas quedaron limpias con una sola escucha. Lo demás vuelve con material nuevo para que afines el oído, no memorices el audio.</p><div className="mt-9 grid grid-cols-3 gap-3"><div className="rounded-2xl border border-border bg-surface p-4"><b className="text-2xl text-ink">{correct}</b><p className="mt-1 text-xs font-bold text-ink-faint">correctas</p></div><div className="rounded-2xl border border-border bg-surface p-4"><b className="text-2xl text-accent">{clean}</b><p className="mt-1 text-xs font-bold text-ink-faint">limpias</p></div><div className="rounded-2xl border border-border bg-surface p-4"><b className="text-2xl text-amber">{outcomes.length - correct}</b><p className="mt-1 text-xs font-bold text-ink-faint">a reforzar</p></div></div><button onClick={() => setScreen("home")} className="mt-9 min-h-12 rounded-2xl bg-accent px-6 font-black text-void">Volver a Listening</button></section></main>;
    }

    if (screen === "completed") return <main className="mx-auto min-h-dvh w-full max-w-6xl bg-void px-5 pb-24 sm:px-8 lg:px-10"><Header onBack={() => setScreen("home")} /><section className="mx-auto mt-20 max-w-xl text-center"><CheckCircle2 className="mx-auto size-14 text-success" /><h1 className="mt-6 text-4xl font-black text-ink">Oído limpio por ahora.</h1><p className="mt-4 text-ink-muted">Terminaste los ejercicios disponibles. Las próximas sesiones traerán contenido nuevo al ampliar el banco.</p><button onClick={() => setScreen("home")} className="mt-8 rounded-xl bg-accent px-5 py-3 font-black text-void">Volver</button></section></main>;

    return <main className="mx-auto min-h-dvh w-full max-w-6xl bg-void px-5 pb-24 sm:px-8 lg:px-10"><Header />
        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-9 sm:px-10 sm:py-12"><div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-accent/10 blur-3xl" /><div className="relative max-w-2xl"><span className="pill-badge bg-accent/10 text-accent-hover">TOEFL ITP · Listening Comprehension</span><h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-ink sm:text-6xl">Entrena el oído,<br /><span className="text-accent">no la memoria.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg">Audios pequeños, decisiones reales y repetición espaciada. Una respuesta limpia se gana en la primera escucha.</p><div className="mt-8 flex flex-wrap gap-3"><button disabled={starting} onClick={() => void startPractice("quick")} className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-accent px-6 font-black text-void shadow-[0_14px_34px_rgba(222,255,85,0.14)] hover:brightness-110 disabled:opacity-50"><Headphones size={19} /> {starting ? "Preparando…" : "Escuchar 5"}</button><button disabled={starting} onClick={() => void startPractice("long")} className="inline-flex min-h-13 items-center gap-2 rounded-2xl border border-border-strong bg-void/60 px-6 font-black text-ink hover:border-accent/45 disabled:opacity-50"><Waves size={19} className="text-accent" /> Audio largo · 5 preguntas</button></div></div></section>
        <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]"><div className="rounded-3xl border border-border bg-surface/70 p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">Tu oído</p><h2 className="mt-2 text-2xl font-black text-ink">{progress.clean} de {progress.total} limpios</h2></div><span className="text-3xl font-black text-accent">{progress.percent}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress.percent}%` }} /></div><p className="mt-4 text-sm text-ink-muted">{progress.recovery ? `${progress.recovery} ejercicio${progress.recovery === 1 ? "" : "s"} espera${progress.recovery === 1 ? "" : "n"} recuperación.` : "Tu siguiente sesión equilibrará habilidades y dificultad."}</p></div><div className="rounded-3xl border border-border bg-surface/70 p-6"><Sparkles className="text-amber" size={22} /><h2 className="mt-4 text-xl font-black text-ink">Dos formatos reales</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-ink-muted"><li><b className="text-ink">Micro audios:</b> una situación, una pregunta.</li><li><b className="text-ink">Audio largo:</b> una charla o conversación y cinco preguntas conectadas.</li></ul></div></section>
        <section className="mt-6 rounded-3xl border border-border bg-surface/50 p-6"><p className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">Qué se está entrenando</p><div className="mt-4 flex flex-wrap gap-2">{data.skills.map((skill) => <span key={skill.code} className="rounded-full border border-border bg-void/60 px-3 py-1.5 text-xs font-bold text-ink-muted">{skill.name_es}</span>)}</div></section>
        {error ? <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">{error}</p> : null}
    </main>;
}
