import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Check,
  Clock3,
  CloudOff,
  Headphones,
  Layers3,
  RotateCcw,
} from "lucide-react";

const sessionSteps = [
  {
    moment: "Ahora",
    title: "12 tarjetas vencidas",
    detail: "Empieza por lo que está a punto de olvidarse.",
    tone: "accent",
  },
  {
    moment: "Después",
    title: "Una lectura de 8 minutos",
    detail: "Vocabulario técnico dentro de un contexto real.",
    tone: "amber",
  },
  {
    moment: "Al conectarte",
    title: "Tu avance se sincroniza",
    detail: "La sesión queda guardada aunque la red falle.",
    tone: "success",
  },
] as const;

const capabilities = [
  {
    Icon: Brain,
    title: "Repetición espaciada",
    description:
      "Macitta ordena cada repaso según tu memoria, no según el orden del mazo.",
  },
  {
    Icon: BookOpenText,
    title: "Inglés dentro de contexto",
    description:
      "Practica vocabulario, reading y grammar con el tipo de inglés que encuentras al estudiar.",
  },
  {
    Icon: Headphones,
    title: "Preparación TOEFL",
    description:
      "Reading, grammar y listening viven junto a tus mazos y tu historial.",
  },
  {
    Icon: CloudOff,
    title: "Sesiones sin conexión",
    description:
      "Abre la app, estudia y conserva tu avance aun cuando el internet sea inestable.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-void text-ink">
      <header className="sticky top-0 z-50 border-b border-border bg-void/88 backdrop-blur-xl">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
        >
          <Link
            href="/"
            aria-label="Macitta, inicio"
            className="inline-flex min-h-11 items-center"
          >
            <Logo
              variant="full"
              size={31}
              className="text-ink"
              iconClassName="text-accent"
              textClassName="text-[1.05rem] font-black"
            />
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-semibold text-ink-muted transition-colors hover:text-ink max-[359px]:hidden sm:px-4"
            >
              Entrar
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-void transition-colors hover:bg-accent-hover sm:px-5"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_76%_22%,rgba(124,133,232,0.16),transparent_32%),radial-gradient(circle_at_15%_0%,rgba(232,184,75,0.07),transparent_28%)]"
          />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-7 flex items-center gap-3 text-sm font-bold text-accent">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="absolute inline-flex size-full rounded-full bg-accent opacity-30" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
                </span>
                Tu siguiente repaso ya está listo
              </div>

              <h1 className="max-w-[12ch] text-balance text-[clamp(3rem,6vw,5.25rem)] font-black leading-[0.98] tracking-[-0.04em] text-ink">
                Recuerda el inglés cuando de verdad lo necesitas.
              </h1>

              <p className="mt-7 max-w-[58ch] text-pretty text-base leading-8 text-ink-muted sm:text-lg">
                Macitta organiza tu vocabulario, lecturas y práctica TOEFL con
                repetición espaciada. Estudia unos minutos, incluso sin conexión,
                y retoma exactamente donde te quedaste.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-accent px-6 py-3.5 text-base font-black text-void shadow-[0_14px_38px_rgba(124,133,232,0.22)] transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_18px_44px_rgba(124,133,232,0.3)] active:translate-y-0"
                >
                  Crear mi espacio de estudio
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl border border-border-strong bg-surface/45 px-6 py-3.5 text-base font-bold text-ink transition-colors hover:border-accent/35 hover:bg-surface"
                >
                  Continuar mi progreso
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm text-ink-faint">
                <Check size={15} className="shrink-0 text-success" />
                Progreso local, sesiones cortas y ninguna racha obligatoria.
              </p>
            </div>

            <div className="relative lg:translate-x-5">
              <div
                aria-hidden="true"
                className="absolute -inset-8 -z-10 rounded-full bg-accent/10 blur-3xl"
              />

              <div className="overflow-hidden rounded-[1.75rem] border border-border-strong bg-surface shadow-[0_36px_100px_-36px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-black text-ink">Sesión de hoy</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      7 de 18 repasos completados
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber">
                    <Clock3 size={15} />
                    8 min
                  </div>
                </div>

                <div className="h-1 bg-void-soft">
                  <div className="h-full w-[39%] bg-accent" />
                </div>

                <div className="grid sm:grid-cols-[8.5rem_1fr]">
                  <div className="hidden border-r border-border bg-void/28 p-5 sm:block">
                    <p className="text-xs font-bold text-ink-faint">Cola de estudio</p>
                    <div className="mt-5 space-y-5">
                      {[
                        ["Vocabulario", "12"],
                        ["Reading", "1"],
                        ["Listening", "2"],
                      ].map(([label, value], index) => (
                        <div
                          key={label}
                          className={index === 0 ? "text-accent" : "text-ink-faint"}
                        >
                          <div className="text-2xl font-black">{value}</div>
                          <div className="mt-0.5 text-xs">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 lg:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                        Documentación técnica
                      </span>
                      <span className="text-xs font-semibold text-ink-faint">
                        EN → ES
                      </span>
                    </div>

                    <div className="py-10 sm:py-12">
                      <p className="text-[2.65rem] font-black leading-none tracking-[-0.035em] text-ink sm:text-5xl">
                        allocate
                      </p>
                      <p className="mt-3 text-lg font-bold text-accent">
                        asignar · destinar
                      </p>
                      <p className="mt-6 border-l border-border-strong pl-4 text-sm leading-7 text-ink-muted">
                        “The operating system allocates memory to each process.”
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-void/35 px-4 text-sm font-bold text-ink-muted">
                        Todavía no
                      </div>
                      <div className="flex min-h-12 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-void">
                        Lo recordé
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border bg-void/20 px-5 py-4 text-xs sm:px-6">
                  <div className="flex items-center gap-2 font-semibold text-ink-muted">
                    <RotateCcw size={14} className="text-success" />
                    Próximo repaso estimado: 3 días
                  </div>
                  <span className="hidden text-ink-faint sm:inline">SREM activo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Ventajas principales"
          className="border-y border-border bg-surface/25"
        >
          <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
            {[
              {
                Icon: CloudOff,
                title: "Estudia sin conexión",
                detail: "La sesión sigue aunque la red no.",
              },
              {
                Icon: Layers3,
                title: "Todo en una sola ruta",
                detail: "Mazos, reading, grammar y TOEFL.",
              },
              {
                Icon: Brain,
                title: "Repasa con intención",
                detail: "Primero vuelve lo que más necesitas.",
              },
            ].map(({ Icon, title, detail }) => (
              <div
                key={title}
                className="flex gap-4 border-b border-border px-5 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:px-8 sm:last:border-r-0"
              >
                <Icon size={21} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <h2 className="text-sm font-black text-ink">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-black text-amber">Una sesión con dirección</p>
              <h2 className="mt-4 max-w-[12ch] text-balance text-4xl font-black leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl">
                Abres la app y sabes qué sigue.
              </h2>
              <p className="mt-6 max-w-md text-pretty text-base leading-8 text-ink-muted">
                Sin menús que te hagan planear antes de estudiar. Macitta reúne lo
                pendiente y lo convierte en una ruta breve que puedes terminar.
              </p>
            </div>

            <div className="border-t border-border-strong">
              {sessionSteps.map((step) => {
                const toneClass =
                  step.tone === "amber"
                    ? "bg-amber"
                    : step.tone === "success"
                      ? "bg-success"
                      : "bg-accent";

                return (
                  <div
                    key={step.moment}
                    className="grid gap-3 border-b border-border py-7 sm:grid-cols-[8rem_1fr] sm:gap-8 sm:py-9"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${toneClass}`}
                      />
                      <span className="text-sm font-bold text-ink-faint">
                        {step.moment}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-ink">{step.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-ink-muted">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/30 px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-end">
              <div>
                <p className="text-sm font-black text-accent">
                  Menos administración, más práctica
                </p>
                <h2 className="mt-4 max-w-[14ch] text-balance text-4xl font-black leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl">
                  Tu estudio no debería sentirse como otro pendiente.
                </h2>
              </div>
              <p className="max-w-xl text-pretty text-base leading-8 text-ink-muted lg:justify-self-end">
                El mismo espacio acompaña tus mazos personales, la práctica para
                TOEFL y el vocabulario que encuentras en clase o en documentación.
              </p>
            </div>

            <div className="mt-16 grid border-t border-border-strong md:grid-cols-2">
              {capabilities.map(({ Icon, title, description }, index) => (
                <div
                  key={title}
                  className={`grid grid-cols-[2.5rem_1fr] gap-4 border-b border-border py-7 md:px-8 md:py-9 ${
                    index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"
                  }`}
                >
                  <Icon size={22} className="mt-1 text-accent" />
                  <div>
                    <h3 className="text-lg font-black text-ink">{title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-7 text-ink-muted">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent px-5 py-20 text-void sm:px-8 sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black text-void/70">Tu próxima sesión</p>
              <h2 className="mt-4 max-w-[15ch] text-balance text-4xl font-black leading-[1.03] tracking-[-0.035em] sm:text-5xl">
                Empieza con lo que ya estás estudiando.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-void/75">
                Crea un mazo, importa tu material y deja que Macitta ordene el
                siguiente repaso.
              </p>
            </div>

            <Link
              href="/auth/signup"
              className="group inline-flex min-h-13 shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-void px-6 py-3.5 text-base font-black text-ink transition-transform duration-200 ease-out hover:-translate-y-0.5 lg:self-auto"
            >
              Crear mi cuenta
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-void px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Logo
            variant="full"
            size={27}
            className="text-ink"
            iconClassName="text-accent"
            textClassName="font-black"
          />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link
              href="/privacidad"
              className="text-ink-muted transition-colors hover:text-accent font-medium"
            >
              Aviso de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-ink-muted transition-colors hover:text-accent font-medium"
            >
              Términos de Servicio
            </Link>
            <span className="text-ink-faint hidden md:inline">•</span>
            <p className="text-ink-faint">
              Hecha para estudiar con calma, incluso cuando la conexión no acompaña.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
