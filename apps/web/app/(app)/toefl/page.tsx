import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { createClient } from "@/utils/supabase/server";
import type { TOEFLExam, TOEFLQuestion } from "@/types/models";
import {
    ArrowRight, BookOpen, GraduationCap,
    Headphones, PenTool, Timer,
} from "lucide-react";

export const dynamic = "force-dynamic";

type ExamWithQuestions = TOEFLExam & { questions?: Pick<TOEFLQuestion, "id">[] };

/** Icon + colour metadata keyed by exam section. */
const SECTION_META = {
    reading:   { label: "Reading",   icon: BookOpen,    color: "text-success bg-success/10 border-success/20" },
    grammar:   { label: "Grammar",   icon: PenTool,     color: "text-accent  bg-accent/10  border-accent/20"  },
    listening: { label: "Listening", icon: Headphones,  color: "text-amber   bg-amber/10   border-amber/20"   },
} as const;

type Section = keyof typeof SECTION_META;

/**
 * TOEFLPracticePage — lists all available exams grouped by section.
 * Each card offers Flexible (review after each answer) and Strict (timed, no peeking) modes.
 */
export default async function TOEFLPracticePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-center text-ink-faint">No autorizado</div>;
    }

    const { data: exams } = await supabase
        .from("exams")
        .select("*, questions(id)")
        .order("created_at", { ascending: true });

    const typedExams = (exams || []) as ExamWithQuestions[];

    return (
        <>
            <AppHeader />
            <div className="flex flex-col gap-5 pb-24">

                {/* ── Hero ──────────────────────────────────────── */}
                <header className="glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                    <span className="pill-badge bg-accent/10 text-accent border border-accent/20 mb-4">
                        <GraduationCap size={11} /> TOEFL Prep
                    </span>
                    <h1 className="text-3xl font-black leading-tight text-ink">Prácticas TOEFL</h1>
                    <p className="readable-copy mt-2">
                        Entrena Reading, Grammar y Listening con modo flexible o simulacro estricto.
                    </p>
                </header>

                {/* ── Exam grid ─────────────────────────────────── */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {typedExams.map((exam) => {
                        const meta          = SECTION_META[exam.section as Section];
                        const Icon          = meta.icon;
                        const questionCount = exam.questions?.length ?? 0;

                        return (
                            <article
                                key={exam.id}
                                className="group glass-card rounded-2xl p-5 transition-all hover:border-accent/35 hover:-translate-y-0.5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className={`pill-badge border ${meta.color} mb-3`}>
                                            <Icon size={11} /> {meta.label}
                                        </span>
                                        <h2 className="text-lg font-black text-ink leading-tight">{exam.title}</h2>
                                        <p className="text-xs text-ink-faint mt-1 uppercase tracking-wide">
                                            {questionCount} preguntas · flexible o estricto
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-5">
                                    <Link
                                        href={`/toefl/${exam.id}?mode=flexible`}
                                        className="h-11 rounded-xl bg-void/50 border border-border text-ink-faint
                                                   hover:text-ink hover:border-border-strong
                                                   transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        Flexible <ArrowRight size={15} />
                                    </Link>
                                    <Link
                                        href={`/toefl/${exam.id}?mode=strict`}
                                        className="h-11 rounded-xl bg-accent text-void border border-accent/20
                                                   shadow-[0_4px_14px_rgba(124,133,232,0.28)]
                                                   hover:bg-accent-hover
                                                   transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <Timer size={15} /> Estricto
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </div>
        </>
    );
}
