import Link from "next/link";
import { Cloud, ArrowRight, Zap, Brain, Shield } from "lucide-react";
import { ZenButton } from "@/components/ui/ZenButton";

export default function LandingPage() {
    return (
        <div className="flex flex-col gap-12 h-full">
            {/* Hero Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-focus/20 flex items-center justify-center">
                        <Cloud size={20} className="text-accent-focus" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Macitta</h1>
                </div>
                <Link href="/auth/login" className="text-sm font-medium text-text-dim hover:text-white transition-colors">
                    Iniciar Sesión
                </Link>
            </header>

            {/* Hero Section */}
            <section className="flex flex-col gap-6 mt-8">
                <h2 className="text-4xl font-extrabold leading-tight">
                    Domina tus <span className="text-accent-focus">Verbos</span> con enfoque.
                </h2>
                {/* Tagline removed as requested */}

                <div className="flex flex-col gap-3 mt-4">
                    <Link href="/auth/signup" className="w-full">
                        <ZenButton variant="primary" className="w-full h-12 text-lg">
                            Empezar Ahora <ArrowRight size={18} className="ml-2" />
                        </ZenButton>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 gap-4 mt-auto">
                <div className="bg-stone-surface p-5 rounded-2xl border border-border-subtle">
                    <Zap size={24} className="text-yellow-400 mb-3" />
                    <h3 className="font-bold mb-1">Modo Offline</h3>
                    <p className="text-sm text-text-dim">Instálala en tu dispositivo y estudia donde sea.</p>
                </div>

                <div className="bg-stone-surface p-5 rounded-2xl border border-border-subtle">
                    <Brain size={24} className="text-accent-focus mb-3" />
                    <h3 className="font-bold mb-1">Algoritmo FSRS</h3>
                    <p className="text-sm text-text-dim">Repaso inteligente que se adapta a tu memoria.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-xs text-text-dim mt-8">
                © 2026 Macitta. Hecho para la excelencia.
            </footer>
        </div>
    );
}
