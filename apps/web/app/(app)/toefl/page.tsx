import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { createClient } from "@/utils/supabase/server";
import type { TOEFLExam, TOEFLQuestion } from "@/types/models";
import { ArrowRight, BookOpen, GraduationCap, Headphones, PenTool, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

type ExamWithQuestions = TOEFLExam & { questions?: Pick<TOEFLQuestion, "id">[] };

const sectionMeta = {
    reading: { label: "Reading", icon: BookOpen, className: "text-emerald-400 bg-emerald-500/10" },
    grammar: { label: "Grammar", icon: PenTool, className: "text-sky-400 bg-sky-500/10" },
    listening: { label: "Listening", icon: Headphones, className: "text-amber-400 bg-amber-500/10" },
} as const;

export default async function TOEFLPracticePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
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
                <header className="px-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-focus/10 text-accent-focus border border-accent-focus/20 text-[11px] font-bold uppercase tracking-wider mb-4">
                        <GraduationCap size={13} />
                        TOEFL Prep
                    </div>
                    <h1 className="text-3xl font-black leading-tight text-white">Prácticas TOEFL</h1>
                    <p className="text-sm text-text-dim mt-2 leading-relaxed">
                        Entrena Reading, Grammar y Listening con modo flexible o simulacro estricto.
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-3">
                    {typedExams.map((exam) => {
                        const meta = sectionMeta[exam.section];
                        const Icon = meta.icon;
                        const questionCount = exam.questions?.length ?? 0;

                        return (
                            <article
                                key={exam.id}
                                className="group bg-stone-surface border border-border-subtle rounded-3xl p-5 transition-all hover:border-accent-focus/50 hover:-translate-y-0.5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
                                            <Icon size={12} />
                                            {meta.label}
                                        </span>
                                        <h2 className="text-lg font-black text-white mt-3 leading-tight">{exam.title}</h2>
                                        <p className="text-xs text-text-dim mt-1 uppercase tracking-wider">
                                            {questionCount} preguntas · flexible o estricto
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-5">
                                    <Link
                                        href={`/toefl/${exam.id}?mode=flexible`}
                                        className="h-11 rounded-2xl bg-void border border-border-subtle text-text-dim hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        Flexible <ArrowRight size={15} />
                                    </Link>
                                    <Link
                                        href={`/toefl/${exam.id}?mode=strict`}
                                        className="h-11 rounded-2xl bg-accent-focus text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold"
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
