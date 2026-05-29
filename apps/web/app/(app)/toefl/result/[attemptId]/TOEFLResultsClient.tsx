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

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function optionText(question: TOEFLQuestion, optionId: string | null) {
    if (!optionId) return "Sin respuesta";
    return question.options.find((option) => option.id === optionId)?.text ?? optionId;
}

function buildTutorPrompt(exam: TOEFLExam, questions: TOEFLQuestion[], answersByQuestion: Map<string, TOEFLQuestionAnswer>, selectedIds: Set<string>) {
    const reference = exam.passage_text || exam.transcript || "Esta práctica no incluyó material de referencia extendido.";
    const details = questions
        .filter((question) => selectedIds.has(question.id))
        .map((question) => {
            const answer = answersByQuestion.get(question.id);
            const options = question.options.map((option) => `* ${option.id}) ${option.text}`).join("\n");

            return `=========================================
PREGUNTA: ${question.question_text}
Opciones presentadas en el examen:
${options}

Mi respuesta elegida: ${optionText(question, answer?.user_choice ?? null)}
Respuesta correcta: ${optionText(question, question.correct_option_id)}
Explicación estática de la app: ${question.explanation}
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

export function TOEFLResultsClient({ attemptId, userId }: TOEFLResultsClientProps) {
    const supabase = useMemo(() => createClient(), []);
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);

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
                        exam: exam as TOEFLExam,
                        attempt: attempt as TOEFLAttempt,
                        questions: questions as TOEFLQuestion[],
                        answers: answers as TOEFLQuestionAnswer[],
                    };
                    setResult(nextResult);
                    setSelectedIds(new Set(nextResult.answers.filter((answer) => !answer.is_correct).map((answer) => answer.question_id)));
                    setLoading(false);
                    return;
                }
            }

            const localResult = await loadLocalResult(attemptId, userId);
            if (!cancelled) {
                setResult(localResult);
                setSelectedIds(new Set(localResult?.answers.filter((answer) => !answer.is_correct).map((answer) => answer.question_id) ?? []));
                setLoading(false);
            }
        }

        loadResult();
        return () => { cancelled = true; };
    }, [attemptId, supabase, userId]);

    const answersByQuestion = useMemo(() => new Map(result?.answers.map((answer) => [answer.question_id, answer]) ?? []), [result]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-3 text-text-dim">
                <Loader2 className="animate-spin text-accent-focus" />
                <p className="text-sm">Cargando resultado...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-xl font-black text-white">Resultado no encontrado</h1>
                <p className="text-sm text-text-dim mt-2">No pudimos encontrar este intento en Supabase ni en este dispositivo.</p>
                <Link href="/toefl" className="inline-flex mt-6 text-accent-focus font-bold">Volver a prácticas</Link>
            </div>
        );
    }

    const { exam, attempt, questions, answers } = result;
    const correctCount = answers.filter((answer) => answer.is_correct).length;
    const accuracy = Math.round((correctCount / Math.max(questions.length, 1)) * 100);
    const maxRaw = questions.reduce((total, question) => total + question.points_weight, 0);
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
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await navigator.clipboard.writeText(prompt);
        setCopying(false);
        setCopied(true);
    }

    function toggleQuestion(questionId: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) next.delete(questionId);
            else next.add(questionId);
            return next;
        });
    }

    return (
        <div className="flex flex-col gap-5 pb-24">
            <Link href="/toefl" className="inline-flex items-center gap-1 text-sm text-text-dim hover:text-white transition-colors">
                <ArrowLeft size={16} /> Volver a prácticas
            </Link>

            <section className="bg-stone-surface border border-border-subtle rounded-3xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-accent-focus font-bold">{exam.section} · resultado</p>
                        <h1 className="text-2xl font-black text-white mt-1">{attempt.scaled_score}/30</h1>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-accent-focus/15 text-accent-focus flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                </div>
                <p className="text-sm text-text-dim leading-relaxed mt-4">{rangeMessage}</p>

                <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="bg-void/60 rounded-2xl p-3 text-center">
                        <div className="text-lg font-black">{attempt.raw_score}/{maxRaw}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-dim">Raw</div>
                    </div>
                    <div className="bg-void/60 rounded-2xl p-3 text-center">
                        <div className="text-lg font-black">{accuracy}%</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-dim">Precisión</div>
                    </div>
                    <div className="bg-void/60 rounded-2xl p-3 text-center">
                        <div className="text-lg font-black">{formatTime(attempt.time_taken)}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-dim">Tiempo</div>
                    </div>
                </div>
            </section>

            {exam.section === "listening" && exam.transcript && (
                <section className="bg-void/60 border border-border-subtle rounded-3xl p-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-dim">Transcripción</h2>
                    <p className="text-sm text-zinc-200 leading-7 mt-3">{exam.transcript}</p>
                </section>
            )}

            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-dim">Revisión</h2>
                    <span className="text-xs text-text-dim">{selectedIds.size} seleccionadas</span>
                </div>

                {questions.map((question) => {
                    const answer = answersByQuestion.get(question.id);
                    const isCorrect = Boolean(answer?.is_correct);
                    const selected = selectedIds.has(question.id);

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => toggleQuestion(question.id)}
                            className={`w-full text-left rounded-3xl border p-5 transition-all ${
                                selected ? "border-accent-focus bg-accent-focus/10" : "border-border-subtle bg-stone-surface"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    isCorrect ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                                }`}>
                                    {isCorrect ? <Check size={15} /> : <X size={15} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white leading-snug">{question.question_text}</h3>
                                    <p className="text-xs text-text-dim mt-3">
                                        Tu respuesta: <span className="text-white">{optionText(question, answer?.user_choice ?? null)}</span>
                                    </p>
                                    <p className="text-xs text-text-dim mt-1">
                                        Correcta: <span className="text-emerald-400">{optionText(question, question.correct_option_id)}</span>
                                    </p>
                                    <p className="text-sm text-zinc-300 leading-relaxed mt-3">{question.explanation}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </section>

            <button
                type="button"
                onClick={copyPrompt}
                disabled={copying || selectedIds.size === 0}
                className="h-13 py-4 rounded-2xl bg-accent-focus text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {copying ? <Loader2 className="animate-spin" size={18} /> : <Clipboard size={18} />}
                {copied ? "Prompt copiado" : copying ? "Preparando tutoría" : "Preparar tutoría de IA"}
            </button>
        </div>
    );
}
