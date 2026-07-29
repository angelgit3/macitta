import Link from "next/link";
import { ArrowUpRight, BookOpen, Headphones, PenTool } from "lucide-react";

const MODULES = [
    {
        label: "Grammar",
        href: "/grammar",
        icon: PenTool,
        tone: "border-amber/25 bg-amber/5 text-amber hover:border-amber/60 hover:bg-amber/10",
    },
    {
        label: "Reading",
        href: "/reading",
        icon: BookOpen,
        tone: "border-sky-300/25 bg-sky-300/5 text-sky-300 hover:border-sky-300/60 hover:bg-sky-300/10",
    },
    {
        label: "Listening",
        href: "/listening",
        icon: Headphones,
        tone: "border-accent/25 bg-accent/5 text-accent hover:border-accent/60 hover:bg-accent/10",
    },
] as const;

export default function TOEFLPracticePage() {
    return (
        <main className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-4xl items-center px-1 pb-24 sm:px-4">
            <section className="w-full" aria-labelledby="toefl-title">
                <p className="text-center text-xs font-black uppercase tracking-[0.22em] text-ink-faint">TOEFL ITP</p>
                <h1 id="toefl-title" className="mt-3 text-center text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">Elige una sección.</h1>

                <nav className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Secciones de preparación TOEFL">
                    {MODULES.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link
                                key={module.href}
                                href={module.href}
                                className={`group flex min-h-40 flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${module.tone}`}
                            >
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-void/45" aria-hidden="true">
                                    <Icon size={21} />
                                </span>
                                <span className="flex items-center justify-between gap-3 text-xl font-black tracking-[-0.03em] text-ink">
                                    {module.label}
                                    <ArrowUpRight size={19} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </section>
        </main>
    );
}
