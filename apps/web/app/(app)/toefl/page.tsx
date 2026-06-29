import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { createClient } from "@/utils/supabase/server";
import type { TOEFLAttempt, TOEFLExam, TOEFLQuestion, TOEFLSection } from "@/types/models";
import {
    ArrowRight,
    BookOpen,
    Clock3,
    GraduationCap,
    Headphones,
    History,
    PenTool,
    Timer,
    Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

type ExamWithQuestions = TOEFLExam & { questions?: Pick<TOEFLQuestion, "id">[] };
type AttemptSummary = Pick<TOEFLAttempt, "id" | "exam_id" | "scaled_score" | "mode" | "completed_at">;

const SECTION_ORDER: TOEFLSection[] = ["reading", "grammar", "listening"];

const SECTION_META = {
    reading: {
        label: "Reading",
        description: "Comprensión, propósito y vocabulario en contexto.",
        icon: BookOpen,
        iconClass: "bg-success/10 text-success",
    },
    grammar: {
        label: "Grammar",
        description: "Estructura, concordancia y uso académico del idioma.",
        icon: PenTool,
        iconClass: "bg-accent/10 text-accent",
    },
    listening: {
        label: "Listening",
        description: "Conversaciones académicas con audio y transcripción posterior.",
        icon: Headphones,
        iconClass: "bg-amber/10 text-amber",
    },
} as const;

function formatAttemptDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default async function TOEFLPracticePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="product-panel rounded-2xl p-8 text-center">
                <h1 className="text-xl font-black text-ink">Inicia sesión para practicar</h1>
                <p className="mt-2 text-sm text-ink-muted">Tu progreso TOEFL se guarda en tu cuenta y en este dispositivo.</p>
                <Link href="/auth/login" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 font-bold text-void">
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    const [{ data: exams, error: examsError }, { data: attempts, count: attemptCount }] = await Promise.all([
        supabase
            .from("exams")
            .select("*, questions(id)")
            .order("created_at", { ascending: true }),
        supabase
            .from("user_exam_attempts")
            .select("id, exam_id, scaled_score, mode, completed_at", { count: "exact" })
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false }),
    ]);

    const typedExams = (exams ?? []) as ExamWithQuestions[];
    const typedAttempts = (attempts ?? []) as AttemptSummary[];
    const examById = new Map(typedExams.map((exam) => [exam.id, exam]));
    const bestByExam = new Map<string, number>();

    for (const attempt of typedAttempts) {
        bestByExam.set(attempt.exam_id, Math.max(bestByExam.get(attempt.exam_id) ?? 0, attempt.scaled_score));
    }

    const bestScore = typedAttempts.length > 0
        ? Math.max(...typedAttempts.map((attempt) => attempt.scaled_score))
        : null;

    return (
        <>
            <AppHeader />
            <div className="flex flex-col gap-7 pb-24">
                <header className="product-panel rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="section-label text-accent">Preparación TOEFL</p>
                            <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">Practica por sección y mide tu avance.</h1>
                            <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
                                Usa el modo flexible para aprender con calma o el estricto para entrenar tiempo, navegación y escucha bajo presión.
                            </p>
                        </div>
                        <dl className="flex min-w-fit gap-6 rounded-2xl border border-border bg-void/40 px-5 py-4">
                            <div>
                                <dt className="text-xs text-ink-muted">Intentos</dt>
                                <dd className="mt-1 text-xl font-black text-ink">{attemptCount ?? typedAttempts.length}</dd>
                            </div>
                            <div className="border-l border-border pl-6">
                                <dt className="text-xs text-ink-muted">Mejor score</dt>
                                <dd className="mt-1 text-xl font-black text-ink">{bestScore == null ? "—" : `${bestScore}/30`}</dd>
                            </div>
                        </dl>
                    </div>
                </header>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/55 p-4">
                        <Clock3 size={19} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                        <div>
                            <h2 className="text-sm font-bold text-ink">Modo flexible</h2>
                            <p className="mt-1 text-sm leading-6 text-ink-muted">Navega libremente y controla el audio mientras practicas.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/55 p-4">
                        <Timer size={19} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
                        <div>
                            <h2 className="text-sm font-bold text-ink">Simulacro estricto</h2>
                            <p className="mt-1 text-sm leading-6 text-ink-muted">Cuenta regresiva, avance continuo y audio de una sola reproducción.</p>
                        </div>
                    </div>
                </div>

                {examsError ? (
                    <section className="rounded-2xl border border-danger/25 bg-danger/10 p-6" role="alert">
                        <h2 className="font-bold text-danger">No pudimos cargar las prácticas</h2>
                        <p className="mt-2 text-sm text-ink-muted">Recarga la página o inténtalo de nuevo cuando recuperes conexión.</p>
                    </section>
                ) : typedExams.length === 0 ? (
                    <section className="product-panel rounded-2xl p-8 text-center">
                        <GraduationCap size={30} className="mx-auto text-accent" aria-hidden="true" />
                        <h2 className="mt-4 text-xl font-black text-ink">Todavía no hay prácticas disponibles</h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-muted">El contenido TOEFL aparecerá aquí en cuanto se sincronice con el servidor.</p>
                    </section>
                ) : (
                    <div className="space-y-8">
                        {SECTION_ORDER.map((section) => {
                            const sectionExams = typedExams.filter((exam) => exam.section === section);
                            if (sectionExams.length === 0) return null;
                            const meta = SECTION_META[section];
                            const Icon = meta.icon;

                            return (
                                <section key={section} aria-labelledby={`section-${section}`}>
                                    <div className="mb-3 flex items-start gap-3 px-1">
                                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}>
                                            <Icon size={19} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 id={`section-${section}`} className="text-lg font-black text-ink">{meta.label}</h2>
                                            <p className="mt-0.5 text-sm text-ink-muted">{meta.description}</p>
                                        </div>
                                    </div>

                                    <div className="product-panel divide-y divide-border overflow-hidden rounded-2xl">
                                        {sectionExams.map((exam) => {
                                            const questionCount = exam.questions?.length ?? 0;
                                            const previousBest = bestByExam.get(exam.id);

                                            return (
                                                <article key={exam.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-bold leading-snug text-ink">{exam.title}</h3>
                                                            {previousBest != null && (
                                                                <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-xs font-bold text-success">
                                                                    <Trophy size={12} aria-hidden="true" /> Mejor {previousBest}/30
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-sm text-ink-muted">{questionCount} {questionCount === 1 ? "pregunta" : "preguntas"}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 sm:flex">
                                                        <Link
                                                            href={`/toefl/${exam.id}?mode=flexible`}
                                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-strong px-4 text-sm font-bold text-ink-muted transition-colors hover:border-accent/35 hover:text-ink"
                                                        >
                                                            Practicar <ArrowRight size={15} aria-hidden="true" />
                                                        </Link>
                                                        <Link
                                                            href={`/toefl/${exam.id}?mode=strict`}
                                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-void transition-colors hover:bg-accent-hover"
                                                        >
                                                            <Timer size={15} aria-hidden="true" /> Estricto
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}

                <section aria-labelledby="history-title">
                    <div className="mb-3 flex items-center gap-3 px-1">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-ink-muted">
                            <History size={19} aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="history-title" className="text-lg font-black text-ink">Intentos recientes</h2>
                            <p className="mt-0.5 text-sm text-ink-muted">Revisa respuestas, explicaciones y tiempo empleado.</p>
                        </div>
                    </div>

                    <div className="product-panel overflow-hidden rounded-2xl">
                        {typedAttempts.length === 0 ? (
                            <div className="p-6 text-sm leading-6 text-ink-muted">Completa una práctica y tu historial aparecerá aquí.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {typedAttempts.slice(0, 8).map((attempt) => {
                                    const exam = examById.get(attempt.exam_id);
                                    return (
                                        <Link key={attempt.id} href={`/toefl/result/${attempt.id}`} className="group flex min-h-20 items-center gap-4 px-5 py-4 sm:px-6">
                                            <span className="text-xl font-black text-ink">{attempt.scaled_score}<span className="text-sm text-ink-muted">/30</span></span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-bold text-ink">{exam?.title ?? "Práctica TOEFL"}</span>
                                                <span className="mt-1 block text-xs text-ink-muted">{attempt.mode === "strict" ? "Estricto" : "Flexible"} · {formatAttemptDate(attempt.completed_at)}</span>
                                            </span>
                                            <ArrowRight size={17} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
