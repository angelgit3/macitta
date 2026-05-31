"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { db } from "@/lib/db";
import type { TOEFLAttempt, TOEFLExam, TOEFLQuestion, TOEFLQuestionAnswer } from "@/types/models";
import { ArrowLeft, Check, Clipboard, Loader2, Sparkles, X } from "lucide-react";

interface TOEFLResultsClientProps {
    attemptId: string;
    userId: string;
}

interface ResultData {
    exam: TOEFLExam;
    attempt: TOEFLAttempt;
    questions: TOEFLQuestion[];
    answers: TOEFLQuestionAnswer[];
}

/** Format seconds as "M:SS". */
function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function optionText(question: TOEFLQuestion, optionId: string | null): string {
    if (!optionId) return "Sin respuesta";
    return question.options.find(o => o.id === optionId)?.text ?? optionId;
}

/** Build a structured AI tutor prompt for the selected wrong answers. */
function buildTutorPrompt(
    exam: TOEFLExam,
    questions: TOEFLQuestion[],
    answersByQuestion: Map<string, TOEFLQuestionAnswer>,
    selectedIds: Set<string>,
): string {
    const reference = exam.passage_text || exam.transcript || "Esta práctica no incluyó material de referencia extendido.";
    const details = questions
        .filter(q => selectedIds.has(q.id))
        .map(q => {
            const answer = answersByQuestion.get(q.id);
            const options = q.options.map(o => `* ${o.id}) ${o.text}`).join("\n");
            return `=========================================
PREGUNTA: ${q.question_text}
Opciones presentadas en el examen:
${options}

Mi respuesta elegida: ${optionText(q, answer?.user_choice ?? null)}
Respuesta correcta: ${optionText(q, q.correct_option_id)}
Explicación estática de la app: ${q.explanation}
=========================================`;
        }).join("\n\n");

    return `Actúa como un tutor experto de inglés y preparador para la prueba TOEFL iBT. Acabo de realizar una práctica enfocada en la sección de ${exam.section.toUpperCase()} (Subtipo: ${exam.type}) de mi examen.

A continuación te presento los materiales de estudio que utilicé en esta práctica para que tengas todo el contexto necesario:

---
MATERIAL DE REFERENCIA (Lectura o transcripción del audio escuchado):
${reference}
---

He seleccionado algunas preguntas específicas en las que fallé o en las que tengo dudas sobre su lógica de resolución. Necesito que analices detalladamente cada reactivo y me des una explicación clara que aborde:
1. Por qué la respuesta correcta es la única opción válida técnicamente.
2. Cuál es la trampa o debilidad conceptual en la opción incorrecta que yo seleccioné.
3. Si la sección es de LISTENING, explícame si mi error pudo deberse a homófonos, reducciones del habla conectada o palabras con pronunciación similar.

Aquí están los detalles de las preguntas a analizar:

${details}

Dame una explicación amigable, directa, con formato limpio y explicaciones muy enfocadas para que logre hacer click con mi error y corregir mis vacíos de conocimiento.`;
}

async function loadLocalResult(attemptId: string, userId: string): Promise<ResultData | null> {
    const attempt = await db.toeflAttempts.get(attemptId);
    if (!attempt || attempt.user_id !== userId) return null;

    const [exam, questions, answers] = await Promise.all([
        db.toeflExams.get(attempt.exam_id),
        db.toeflQuestions.where("exam_id").equals(attempt.exam_id).sortBy("order_index"),
        db.toeflAnswers.where("attempt_id").equals(attemptId).toArray(),
    ]);

    if (!exam) return null;
    return { exam, attempt, questions, answers };
}

/**
 * TOEFLResultsClient — shows score breakdown, per-question review,
 * and a one-click AI tutor prompt builder for wrong answers.
 */
export function TOEFLResultsClient({ attemptId, userId }: TOEFLResultsClientProps) {
    const supabase = useMemo(() => createClient(), []);
    const [result,      setResult]      = useState<ResultData | null>(null);
    const [loading,     setLoading]     = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying,     setCopying]     = useState(false);
    const [copied,      setCopied]      = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadResult() {
            const { data: attempt } = await supabase
                .from("user_exam_attempts")
                .select("*")
                .eq("id", attemptId)
                .eq("user_id", userId)
                .maybeSingle();

            if (attempt) {
                const [{ data: exam }, { data: questions }, { data: answers }] = await Promise.all([
                    supabase.from("exams").select("*").eq("id", attempt.exam_id).single(),
                    supabase.from("questions").select("*").eq("exam_id", attempt.exam_id).order("order_index", { ascending: true }),
                    supabase.from("user_question_answers").select("*").eq("attempt_id", attemptId),
                ]);

                if (!cancelled && exam && questions && answers) {
                    const nextResult = {
                        exam:      exam      as TOEFLExam,
                        attempt:   attempt   as TOEFLAttempt,
                        questions: questions as TOEFLQuestion[],
                        answers:   answers   as TOEFLQuestionAnswer[],
                    };
                    setResult(nextResult);
                    setSelectedIds(new Set(nextResult.answers.filter(a => !a.is_correct).map(a => a.question_id)));
                    setLoading(false);
                    return;
                }
            }

            const localResult = await loadLocalResult(attemptId, userId);
            if (!cancelled) {
                setResult(localResult);
                setSelectedIds(new Set(localResult?.answers.filter(a => !a.is_correct).map(a => a.question_id) ?? []));
                setLoading(false);
            }
        }

        loadResult();
        return () => { cancelled = true; };
    }, [attemptId, supabase, userId]);

    const answersByQuestion = useMemo(
        () => new Map(result?.answers.map(a => [a.question_id, a]) ?? []),
        [result],
    );

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-3 text-ink-faint">
                <Loader2 className="animate-spin text-accent" />
                <p className="text-sm">Cargando resultado...</p>
            </div>
        );
    }

    // ── Not found ────────────────────────────────────────────
    if (!result) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-xl font-black text-ink">Resultado no encontrado</h1>
                <p className="text-sm text-ink-faint mt-2">
                    No pudimos encontrar este intento en Supabase ni en este dispositivo.
                </p>
                <Link href="/toefl" className="inline-flex mt-6 text-accent font-bold">
                    Volver a prácticas
                </Link>
            </div>
        );
    }

    const { exam, attempt, questions, answers } = result;
    const correctCount = answers.filter(a => a.is_correct).length;
    const accuracy     = Math.round((correctCount / Math.max(questions.length, 1)) * 100);
    const maxRaw       = questions.reduce((sum, q) => sum + q.points_weight, 0);

    const rangeMessage = attempt.scaled_score >= 24
        ? "Nivel competitivo. Ahora toca pulir precisión bajo presión."
        : attempt.scaled_score >= 16
            ? "Base sólida. Tus errores ya son material de mejora concreto."
            : "Buen inicio. La constancia pesa más que un score aislado.";

    async function copyPrompt() {
        if (selectedIds.size === 0) return;
        setCopying(true);
        setCopied(false);
        const prompt = buildTutorPrompt(exam, questions, answersByQuestion, selectedIds);
        await new Promise(resolve => setTimeout(resolve, 1_500));
        await navigator.clipboard.writeText(prompt);
        setCopying(false);
        setCopied(true);
    }

    function toggleQuestion(questionId: string) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(questionId) ? next.delete(questionId) : next.add(questionId);
            return next;
        });
    }

    return (
        <div className="flex flex-col gap-5 pb-24">
            <Link href="/toefl" className="inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink transition-colors">
                <ArrowLeft size={16} /> Volver a prácticas
            </Link>

            {/* ── Score overview ─────────────────────────────── */}
            <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="label-kicker text-accent">{exam.section} · resultado</p>
                        <h1 className="text-2xl font-black text-ink mt-1">{attempt.scaled_score}/30</h1>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                </div>
                <p className="text-sm text-ink-faint leading-relaxed mt-4">{rangeMessage}</p>

                <div className="grid grid-cols-3 gap-2 mt-6">
                    {[
                        { label: "Raw",       value: `${attempt.raw_score}/${maxRaw}` },
                        { label: "Precisión", value: `${accuracy}%`                  },
                        { label: "Tiempo",    value: formatTime(attempt.time_taken)   },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-void/60 rounded-2xl p-3 text-center">
                            <div className="text-lg font-black">{value}</div>
                            <div className="label-kicker">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Transcript (listening only) ───────────────── */}
            {exam.section === "listening" && exam.transcript && (
                <section className="bg-void/60 border border-border rounded-2xl p-5">
                    <h2 className="label-kicker mb-3">Transcripción</h2>
                    <p className="text-sm text-ink-muted leading-7">{exam.transcript}</p>
                </section>
            )}

            {/* ── Question review ───────────────────────────── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="label-kicker">Revisión</h2>
                    <span className="text-xs text-ink-faint">{selectedIds.size} seleccionadas</span>
                </div>

                {questions.map(question => {
                    const answer    = answersByQuestion.get(question.id);
                    const isCorrect = Boolean(answer?.is_correct);
                    const selected  = selectedIds.has(question.id);

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => toggleQuestion(question.id)}
                            className={`w-full text-left rounded-2xl border p-5 transition-all ${
                                selected
                                    ? "border-accent bg-accent/10"
                                    : "border-border bg-surface"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    isCorrect ? "bg-success/10 text-success" : "bg-danger/15 text-danger"
                                }`}>
                                    {isCorrect ? <Check size={15} /> : <X size={15} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-ink leading-snug">{question.question_text}</h3>
                                    <p className="text-xs text-ink-faint mt-3">
                                        Tu respuesta: <span className="text-ink">{optionText(question, answer?.user_choice ?? null)}</span>
                                    </p>
                                    <p className="text-xs text-ink-faint mt-1">
                                        Correcta: <span className="text-success">{optionText(question, question.correct_option_id)}</span>
                                    </p>
                                    <p className="text-sm text-ink-muted leading-relaxed mt-3">{question.explanation}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </section>

            {/* ── Copy AI prompt ────────────────────────────── */}
            <button
                type="button"
                onClick={copyPrompt}
                disabled={copying || selectedIds.size === 0}
                className="py-4 rounded-2xl bg-accent text-void border border-accent/20 font-black flex items-center justify-center gap-2
                           shadow-[0_4px_14px_rgba(124,133,232,0.28)] hover:bg-accent-hover transition-all disabled:opacity-50"
            >
                {copying ? <Loader2 className="animate-spin" size={18} /> : <Clipboard size={18} />}
                {copied ? "Prompt copiado" : copying ? "Preparando tutoría" : "Preparar tutoría de IA"}
            </button>
        </div>
    );
}
