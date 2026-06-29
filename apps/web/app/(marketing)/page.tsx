import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
  ArrowRight, Brain, Trophy, BookOpen, Flame,
  BarChart2, Smartphone, Library, FileJson, CheckCircle2,
} from "lucide-react";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-void text-ink overflow-x-hidden">

      {/* ── Floating pill nav ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex justify-center px-4 pt-4">
        <nav
          style={{
            background: "rgba(26,27,46,0.82)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow:
              "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 32px -4px rgba(0,0,0,0.50), 0 0 0 1px rgba(160,163,196,0.12)",
          }}
          className="flex items-center justify-between gap-6 px-5 py-3 rounded-full w-full max-w-xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Logo size={16} className="text-accent" />
            </div>
            <span className="text-sm font-black text-ink">Macitta</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-xs font-medium text-ink-muted hover:text-ink transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="text-xs font-bold bg-accent text-void px-4 py-2 rounded-full border border-accent/20
                         shadow-[0_4px_14px_rgba(124,133,232,0.28)]
                         hover:bg-accent-hover hover:shadow-[0_6px_20px_rgba(124,133,232,0.38)]
                         transition-all duration-200 active:scale-[0.97]"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative px-5 pt-20 pb-24 overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-[1fr_0.95fr] gap-12 items-center">
          {/* Left copy */}
          <div>
            <p className="section-label mb-5 text-accent">Estudio diario con repetición espaciada</p>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.03] tracking-tight text-ink mb-5">
              Aprende inglés.<br />
              <span className="text-accent">
                Sin olvidar.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-8 max-w-lg mb-9">
              Una app de estudio para leer, practicar y volver a lo importante sin fricción.
              Tus mazos, TOEFL y progreso viven en el mismo flujo.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-2 min-h-13 bg-accent text-void font-black
                           px-7 py-3.5 rounded-full border border-accent/20
                           shadow-[0_8px_28px_rgba(124,133,232,0.36)]
                           hover:bg-accent-hover hover:shadow-[0_12px_36px_rgba(124,133,232,0.48)]
                           transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97]"
              >
                Empezar gratis
                <span className="w-7 h-7 rounded-full bg-void/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={14} />
                </span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 min-h-13 glass-card font-medium
                           px-7 py-3.5 rounded-full text-ink-muted hover:text-ink
                           transition-all duration-200"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Right — App preview card */}
          <div className="p-[2px] rounded-[1.8rem] bg-gradient-to-b from-white/12 via-white/4 to-white/0">
            <div
              className="glass-panel rounded-[1.6rem] p-4 sm:p-5"
              style={{ boxShadow: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 40px 90px -14px rgba(0,0,0,0.6)" }}
            >
              <div className="rounded-2xl bg-void/55 border border-border p-4 grid grid-rows-[auto_1fr_auto] gap-4 min-h-[400px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="section-label mb-0.5">Hoy</div>
                    <div className="text-xl font-black">Ruta de memoria</div>
                  </div>
                  <span className="pill-badge bg-success/10 text-success border border-success/20">
                    SREM
                  </span>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Tarjetas", value: "Listas",   Icon: BookOpen,  color: "accent" },
                    { label: "Racha",    value: "En curso", Icon: Flame,     color: "amber" },
                    { label: "TOEFL",    value: "3 áreas",  Icon: Trophy,    color: "accent" },
                    { label: "Offline",  value: "Activo",   Icon: BarChart2, color: "none" },
                  ].map(({ label, value, Icon, color }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3.5"
                      style={{ background: "rgba(33,35,58,0.7)", border: "1px solid rgba(160,163,196,0.10)" }}
                    >
                      <Icon
                        size={18}
                        className={
                          color === "amber"
                            ? "text-amber mb-3"
                            : color === "accent"
                            ? "text-accent mb-3"
                            : "text-ink-faint mb-3"
                        }
                      />
                      <div className="text-xl font-black">{value}</div>
                      <div className="text-xs text-ink-faint">{label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA row */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ background: "rgba(124,133,232,0.15)", border: "1px solid rgba(124,133,232,0.22)" }}
                >
                  <div>
                    <div className="text-sm font-black text-ink">Estudio global</div>
                    <div className="text-xs text-ink-muted mt-0.5">Tarjetas vencidas de todos tus mazos</div>
                  </div>
                  <ArrowRight size={18} className="text-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ────────────────────────────────────── */}
      <div className="border-y border-border bg-surface/30">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-border">
          {[
            { value: "SREM",    label: "Memoria a largo plazo" },
            { value: "OFFLINE", label: "Estudio con conexión inestable" },
            { value: "TOEFL",   label: "Reading, Grammar y Listening" },
          ].map(stat => (
            <div key={stat.label} className="py-7 px-3 text-center">
              <div className="text-2xl sm:text-3xl font-black text-ink">{stat.value}</div>
              <div className="text-xs text-ink-faint mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="px-5 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3 text-amber">Un sistema de estudio conectado</p>
            <h2 className="text-3xl sm:text-4xl font-black text-ink">Todo conectado</h2>
            <p className="readable-copy mt-3 max-w-xl mx-auto">
              Macitta mantiene cerca lo que necesitas: repasar, construir mazos, practicar TOEFL y ver tu progreso.
            </p>
          </div>

          <div className="grid grid-cols-1 border-y border-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: CheckCircle2, title: "Repetición espaciada", desc: "SREM optimiza la retención a largo plazo.", accent: "sage" as const },
              { Icon: BarChart2,    title: "Dashboard vivo",       desc: "Racha, tiempo, maestría y actividad sin saturar.", accent: "periwinkle" as const },
              { Icon: Library,      title: "Mazos personales",     desc: "Colecciones propias para estudiar justo lo necesario.", accent: "amber" as const },
              { Icon: FileJson,     title: "Importación JSON",     desc: "Carga materiales externos sin rehacer trabajo.", accent: "periwinkle" as const },
              { Icon: Smartphone,   title: "App instalable",       desc: "Experiencia PWA lista para móvil y sin internet.", accent: "sage" as const },
              { Icon: Brain,        title: "TOEFL integrado",      desc: "Prácticas con score inmediato y revisión.", accent: "amber" as const },
            ].map(({ Icon, title, desc, accent }) => {
              const iconClass =
                accent === "sage"       ? "text-success bg-success/10 border border-success/20" :
                accent === "amber"      ? "text-amber bg-amber/10 border border-amber/20" :
                                          "text-accent bg-accent/10 border border-accent/20";
              return (
                <div
                  key={title}
                  className="border-b border-border p-5 transition-colors hover:bg-white/[0.025] sm:border-r lg:last:border-r-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconClass}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-ink mb-1">{title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <Logo size={13} className="text-accent" />
            </div>
            <span className="text-sm font-bold text-ink">Macitta</span>
          </div>
          <p className="text-xs text-ink-faint">
            2026 Macitta · Sistema de repetición espaciada.
          </p>
        </div>
      </footer>
    </div>
  );
}
