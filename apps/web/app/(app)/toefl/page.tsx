import Link from "next/link";
import { ArrowUpRight, BookOpen, Headphones, PenTool } from "lucide-react";

const MODULES = [
    {
        label: "Grammar",
        href: "/grammar",
        icon: PenTool,
        tone: "border-success/30 bg-success/8 text-success hover:border-success/60 hover:bg-success/12",
    },
    {
        label: "Reading",
        href: "/reading",
        icon: BookOpen,
        tone: "border-border-strong bg-surface-float/60 text-ink hover:border-accent/45 hover:bg-surface-float",
    },
    {
        label: "Listening",
        href: "/listening",
        icon: Headphones,
        tone: "border-amber/30 bg-amber/8 text-amber hover:border-amber/60 hover:bg-amber/12",
    },
] as const;

export default function TOEFLPracticePage() {
    return (
        <main className="mx-auto flex min-h-[calc(100dvh-10rem)] w-full max-w-4xl items-center px-1 pb-24 sm:px-4">
            <section className="w-full" aria-labelledby="toefl-title">
                <p className="text-center text-sm font-black text-amber">Preparación TOEFL ITP</p>
                <h1 id="toefl-title" className="mt-4 text-center text-[clamp(2.5rem,6vw,4rem)] font-black leading-[1.0] tracking-[-0.045em] text-ink">
                    Elige una <span className="text-accent">sección.</span>
                </h1>
                <p className="mx-auto mt-4 max-w-md text-center text-pretty text-base leading-7 text-ink-muted">
                    Reading, grammar y listening viven junto a tus mazos y tu historial.
                </p>

                <nav className="mt-12 grid gap-3 sm:grid-cols-3" aria-label="Secciones de preparación TOEFL">
                    {MODULES.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link
                                key={module.href}
                                href={module.href}
                                className={`group flex min-h-40 flex-col justify-between rounded-3xl border-2 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${module.tone}`}
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
