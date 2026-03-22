import Link from "next/link";
import {
    ArrowRight, Zap, Brain, Users, Trophy, BookOpen, Flame,
    BarChart2, Smartphone, GraduationCap
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-void/80 border-b border-white/5">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-focus/20 flex items-center justify-center">
                            <Zap size={16} className="text-accent-focus" />
                        </div>
                        <span className="text-lg font-black tracking-tight">Macitta</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login"
                            className="text-sm font-medium text-text-dim hover:text-white transition-colors px-4 py-2">
                            Iniciar sesión
                        </Link>
                        <Link href="/auth/signup"
                            className="text-sm font-bold bg-accent-focus hover:bg-accent-focus/90 text-white px-5 py-2.5 rounded-xl transition-colors">
                            Registrarse
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative px-6 pt-20 pb-24 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-focus/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-32 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-2xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-text-dim mb-8">
                        <Flame size={12} className="text-orange-400" />
                        Sistema de Repetición Espaciada con FSRS
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-black leading-[1.1] tracking-tight mb-6">
                        Domina tus{" "}
                        <span className="bg-gradient-to-r from-accent-focus to-purple-400 bg-clip-text text-transparent">
                            verbos
                        </span>
                        {" "}en inglés
                    </h1>

                    <p className="text-lg text-text-dim leading-relaxed max-w-lg mx-auto mb-10">
                        Estudia con un algoritmo que se adapta a tu memoria.
                        Repasa lo justo, en el momento justo. Sin perder tiempo.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/auth/signup"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-focus hover:bg-accent-focus/90 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent-focus/25">
                            Empezar gratis <ArrowRight size={18} />
                        </Link>
                        <Link href="/auth/login"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 font-medium px-8 py-4 rounded-2xl text-base transition-colors text-text-dim hover:text-white">
                            Ya tengo cuenta
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats strip ── */}
            <section className="border-y border-white/5 bg-stone-surface/30">
                <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/5">
                    {[
                        { value: "93", label: "Verbos disponibles" },
                        { value: "FSRS", label: "Algoritmo adaptativo" },
                        { value: "24/7", label: "Estudia sin horario" },
                    ].map(stat => (
                        <div key={stat.label} className="py-8 text-center">
                            <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                            <div className="text-xs text-text-dim mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-black mb-3">¿Cómo funciona?</h2>
                        <p className="text-text-dim">Tres pasos. Cero complicaciones.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            {
                                step: "01",
                                icon: BookOpen,
                                color: "text-blue-400",
                                bg: "bg-blue-400/10",
                                title: "Estudia",
                                desc: "Responde las tarjetas que el algoritmo selecciona para ti cada día."
                            },
                            {
                                step: "02",
                                icon: Brain,
                                color: "text-purple-400",
                                bg: "bg-purple-400/10",
                                title: "El algoritmo aprende",
                                desc: "FSRS calcula cuándo empezarás a olvidar y programa el repaso ideal."
                            },
                            {
                                step: "03",
                                icon: Trophy,
                                color: "text-yellow-400",
                                bg: "bg-yellow-400/10",
                                title: "Domina",
                                desc: "Cada verbo que dominas te acerca al 100% de maestría."
                            },
                        ].map(item => (
                            <div key={item.step}
                                className="relative bg-stone-surface border border-border-subtle rounded-2xl p-6 hover:border-white/15 transition-colors group">
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-text-dim/30 tracking-wider">
                                    PASO {item.step}
                                </span>
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                                    <item.icon size={22} className={item.color} />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-text-dim leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features grid ── */}
            <section className="px-6 py-16 bg-stone-surface/20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black mb-3">Todo lo que necesitas</h2>
                        <p className="text-text-dim">Diseñado para estudiantes y maestros.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                icon: Zap,
                                color: "text-yellow-400",
                                title: "Repetición Espaciada",
                                desc: "Algoritmo FSRS que optimiza tu retención de memoria a largo plazo."
                            },
                            {
                                icon: BarChart2,
                                color: "text-green-400",
                                title: "Dashboard con estadísticas",
                                desc: "Racha, tiempo de estudio, maestría y gráfica de actividad en tiempo real."
                            },
                            {
                                icon: GraduationCap,
                                color: "text-purple-400",
                                title: "Portal Docente",
                                desc: "Los maestros ven el progreso de cada alumno, crean grupos y analizan datos."
                            },
                            {
                                icon: Users,
                                color: "text-emerald-400",
                                title: "Grupos y Ranking",
                                desc: "Compite con tus compañeros. Ve tu posición en el leaderboard de cada clase."
                            },
                            {
                                icon: Smartphone,
                                color: "text-blue-400",
                                title: "App instalable",
                                desc: "Instala Macitta en tu celular como app nativa. Sin tiendas, sin esperas."
                            },
                            {
                                icon: Flame,
                                color: "text-orange-400",
                                title: "Sistema de rachas",
                                desc: "Mantén tu racha diaria para generar el hábito de estudio constante."
                            },
                        ].map(f => (
                            <div key={f.title}
                                className="flex items-start gap-4 bg-stone-surface border border-border-subtle rounded-2xl p-5 hover:border-white/15 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <f.icon size={18} className={f.color} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                                    <p className="text-xs text-text-dim leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-6 py-20">
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent-focus/20 flex items-center justify-center mx-auto mb-6">
                        <Zap size={28} className="text-accent-focus" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">¿Listo para dominar tus verbos?</h2>
                    <p className="text-text-dim mb-8">Crea tu cuenta gratis y empieza a estudiar hoy.</p>
                    <Link href="/auth/signup"
                        className="inline-flex items-center gap-2 bg-accent-focus hover:bg-accent-focus/90 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent-focus/25">
                        Crear cuenta gratis <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-accent-focus/20 flex items-center justify-center">
                            <Zap size={12} className="text-accent-focus" />
                        </div>
                        <span className="text-sm font-bold">Macitta</span>
                    </div>
                    <p className="text-xs text-text-dim">
                        © 2026 Macitta — Sistema de Repetición Espaciada. Servicio Social UPT.
                    </p>
                </div>
            </footer>
        </div>
    );
}
