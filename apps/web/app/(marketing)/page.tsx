import Link from "next/link";
import { Logo, MacittaMarkIcon } from "@/components/ui/Logo";
import { ScallopDivider, Sticker } from "@/components/ui/BrandShapes";
import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  CloudOff,
  Headphones,
  Layers3,
  PenLine,
  RotateCcw,
  WifiOff,
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

const studyModes = [
  { Icon: BookOpenText, label: "Vocabulario", classes: "bg-accent text-void", tilt: "-rotate-3" },
  { Icon: Layers3, label: "Reading", classes: "bg-surface-float text-ink", tilt: "rotate-2" },
  { Icon: PenLine, label: "Grammar", classes: "bg-success text-void", tilt: "-rotate-2" },
  { Icon: Headphones, label: "Listening", classes: "bg-amber text-void", tilt: "rotate-3" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-void text-ink">
      {/* ─── HERO · periwinkle a sangre completa ─────────────── */}
      <section className="relative isolate bg-accent text-void">
        <header className="absolute inset-x-0 top-0 z-20">
          <nav
            aria-label="Navegación principal"
            className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8"
          >
            <Link
              href="/"
              aria-label="Macitta, inicio"
              className="inline-flex min-h-11 items-center gap-2.5 font-black tracking-tight"
            >
              <MacittaMarkIcon size={26} color="#0D0E17" />
              Macitta
            </Link>
            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/auth/login"
                className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-void transition-colors hover:text-void/80 max-[359px]:hidden sm:px-4"
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-void px-4 text-sm font-black text-ink transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] sm:px-5"
              >
                Crear cuenta
              </Link>
            </div>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-10 pt-32 text-center sm:px-8 sm:pt-36">
          <h1 className="relative max-w-full select-none text-[clamp(3rem,13vw,12rem)] font-black leading-[0.85] tracking-[-0.055em] opacity-0 animate-fade-in-up">
            macitta<span className="text-amber">.</span>
            <Sticker className="absolute -right-2 top-0 hidden -rotate-6 bg-void text-ink lg:inline-flex lg:-right-16 animate-float">
              TOEFL
            </Sticker>
            <Sticker className="absolute -left-2 bottom-6 hidden rotate-3 bg-ink text-void lg:inline-flex lg:-left-14 animate-float [animation-delay:-2.7s]">
              <WifiOff size={13} />
              Sin conexión
            </Sticker>
          </h1>

          <p className="mt-10 max-w-[46ch] text-balance text-xl font-bold leading-8 text-void opacity-0 animate-fade-in-up [animation-delay:90ms] sm:text-2xl sm:leading-9">
            Recuerda el inglés cuando de verdad lo necesitas.
          </p>
          <p className="mt-4 max-w-[58ch] text-pretty text-base leading-7 text-void/85 opacity-0 animate-fade-in-up [animation-delay:180ms]">
            Macitta organiza tu vocabulario, lecturas y práctica TOEFL con
            repetición espaciada. Estudia unos minutos, incluso sin conexión, y
            retoma exactamente donde te quedaste.
          </p>

          <div className="mt-9 flex flex-col gap-3 opacity-0 animate-fade-in-up [animation-delay:270ms] sm:flex-row">
            <Link
              href="/auth/signup"
              className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-void px-7 py-3.5 text-base font-black text-ink shadow-[0_16px_40px_-12px_rgba(13,14,23,0.55)] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
            >
              Crear cuenta
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex min-h-13 items-center justify-center rounded-xl border-2 border-void/30 px-7 py-3.5 text-base font-bold text-void transition-[border-color,background-color,transform] duration-200 hover:border-void/60 hover:bg-void/5 active:scale-[0.97]"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <ScallopDivider fill="#0D0E17" />
      </section>

      {/* ─── Sesión de hoy · titular + tarjeta inclinada ────── */}
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <Reveal className="max-w-2xl">
            <p className="flex items-center gap-3 text-sm font-bold text-accent">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inline-flex size-full rounded-full bg-accent opacity-30" />
                <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
              </span>
              Tu siguiente repaso ya está listo
            </p>
            <h2 className="mt-6 max-w-[13ch] text-balance text-[clamp(2.6rem,5vw,4.25rem)] font-black leading-[0.98] tracking-[-0.04em] text-ink">
              Abres la app y sabes qué{" "}
              <span className="text-accent">sigue.</span>
            </h2>
            <p className="mt-6 max-w-[52ch] text-pretty text-base leading-8 text-ink-muted">
              Sin menús que te hagan planear antes de estudiar. Macitta reúne lo
              pendiente y lo convierte en una ruta breve que puedes terminar.
            </p>
          </Reveal>

          {/* Mockup de tarjeta de estudio, inclinado, con stickers */}
          <Reveal delay={130} className="relative mx-auto w-full max-w-lg">
            <div
              aria-hidden="true"
              className="absolute -inset-10 -z-10 rounded-full bg-accent/10 blur-3xl"
            />

            <div className="rotate-2 rounded-[1.75rem] border border-border-strong bg-surface shadow-[0_36px_100px_-36px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:rotate-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-black text-ink">Sesión de hoy</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    7 de 18 repasos completados
                  </p>
                </div>
                <span className="rounded-full border border-amber/25 bg-amber/10 px-3 py-1 text-xs font-bold text-amber">
                  8 min
                </span>
              </div>

              <div className="h-1 bg-void-soft">
                <div className="h-full w-[39%] bg-accent" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent-hover">
                    Documentación técnica
                  </span>
                  <span className="text-xs font-semibold text-ink-faint">
                    EN → ES
                  </span>
                </div>

                <div className="py-9 sm:py-10">
                  <p className="text-[2.5rem] font-black leading-none tracking-[-0.035em] text-ink sm:text-5xl">
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

              <div className="flex items-center justify-between gap-4 border-t border-border bg-void/20 px-5 py-4 text-xs sm:px-6">
                <div className="flex items-center gap-2 font-semibold text-ink-muted">
                  <RotateCcw size={14} className="text-success" />
                  Próximo repaso estimado: 3 días
                </div>
                <span className="hidden text-ink-faint sm:inline">SREM activo</span>
              </div>
            </div>

            <Sticker className="absolute -left-3 top-10 -rotate-6 bg-accent text-void sm:-left-8">
              12 vencidas
            </Sticker>
            <Sticker className="absolute -right-2 top-1/3 rotate-3 bg-amber text-void sm:-right-6">
              8 min
            </Sticker>
            <Sticker className="absolute -bottom-4 left-1/4 -rotate-2 bg-success text-void">
              <CloudOff size={13} />
              Offline
            </Sticker>
          </Reveal>
        </div>
      </section>

      {/* ─── Banda de tres ventajas ─────────────────────────── */}
      <section
        aria-label="Ventajas principales"
        className="border-y border-border bg-surface/25"
      >
        <Reveal className="mx-auto grid max-w-6xl sm:grid-cols-3">
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
                <h3 className="text-sm font-black text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{detail}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ─── Una sesión con dirección ───────────────────────── */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm font-black text-amber">Una sesión con dirección</p>
            <h2 className="mt-4 max-w-[13ch] text-balance text-[clamp(2.4rem,4.5vw,3.75rem)] font-black leading-[1.0] tracking-[-0.04em] text-ink">
              Del bolsillo al repaso en{" "}
              <span className="text-accent">segundos.</span>
            </h2>
            <p className="mt-6 max-w-md text-pretty text-base leading-8 text-ink-muted">
              Cada sesión tiene un orden y un final a la vista. Así estudiar
              deja de ser un pendiente difuso.
            </p>
          </Reveal>

          <Reveal delay={120} className="border-t border-border-strong">
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
          </Reveal>
        </div>
      </section>

      {/* ─── Todo en una sola ruta · capacidades ────────────── */}
      <section className="border-y border-border bg-surface/30 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-black text-accent">
                Menos administración, más práctica
              </p>
              <h2 className="mt-4 max-w-[15ch] text-balance text-[clamp(2.4rem,4.5vw,3.75rem)] font-black leading-[1.0] tracking-[-0.04em] text-ink">
                Tu estudio no debería sentirse como otro{" "}
                <span className="text-accent">pendiente.</span>
              </h2>
            </div>
            <p className="max-w-xl text-pretty text-base leading-8 text-ink-muted lg:justify-self-end">
              El mismo espacio acompaña tus mazos personales, la práctica para
              TOEFL y el vocabulario que encuentras en clase o en documentación.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-16 grid border-t border-border-strong md:grid-cols-2">
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
          </Reveal>
        </div>
      </section>

      {/* ─── Fila de stickers · cuatro modos ────────────────── */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-6xl text-center">
          <h2 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.02] tracking-[-0.04em] text-ink">
            Cuatro modos, <span className="text-accent">un mismo flujo.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-pretty text-base leading-8 text-ink-muted">
            Cambia de vocabulario a listening sin cambiar de app ni perder tu
            historial.
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5 sm:gap-7">
            {studyModes.map(({ Icon, label, classes, tilt }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-3 rounded-[1.5rem] border-2 border-void/85 px-7 py-6 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 ${tilt} ${classes}`}
              >
                <Icon size={30} strokeWidth={2.25} />
                <span className="text-sm font-black">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── CTA final · periwinkle con nube ────────────────── */}
      <section className="bg-accent text-void">
        <div className="-mb-px -translate-y-px rotate-180">
          <ScallopDivider fill="#0D0E17" />
        </div>
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 pb-24 pt-10 text-center sm:px-8 sm:pb-28">
          <h2 className="max-w-[16ch] text-balance text-[clamp(2.6rem,5.5vw,4.5rem)] font-black leading-[0.98] tracking-[-0.04em]">
            Empieza con lo que ya estás estudiando.
          </h2>
          <p className="max-w-xl text-pretty text-base font-semibold leading-7 text-void/85">
            Crea un mazo, importa tu material y deja que Macitta ordene el
            siguiente repaso.
          </p>
          <Link
            href="/auth/signup"
            className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-void px-8 py-4 text-base font-black text-ink shadow-[0_16px_40px_-12px_rgba(13,14,23,0.55)] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Crear mi cuenta
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-void px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-start">
          <div>
            <Logo
              variant="full"
              size={30}
              className="text-ink"
              iconClassName="text-accent"
              textClassName="font-black"
            />
            <p className="mt-4 max-w-[28ch] text-sm leading-6 text-ink-faint">
              Hecha para estudiar con calma, incluso cuando la conexión no
              acompaña.
            </p>
          </div>

          <nav aria-label="Producto" className="text-sm">
            <p className="font-black text-ink">Producto</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/auth/signup" className="text-ink-muted transition-colors hover:text-accent">
                Crear cuenta
              </Link>
              <Link href="/auth/login" className="text-ink-muted transition-colors hover:text-accent">
                Entrar
              </Link>
            </div>
          </nav>

          <nav aria-label="Legal" className="text-sm">
            <p className="font-black text-ink">Legal</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/privacidad" className="text-ink-muted transition-colors hover:text-accent">
                Aviso de Privacidad
              </Link>
              <Link href="/terminos" className="text-ink-muted transition-colors hover:text-accent">
                Términos de Servicio
              </Link>
            </div>
          </nav>

          <MacittaMarkIcon
            size={72}
            color="var(--color-accent)"
            className="hidden opacity-90 sm:block"
          />
        </div>
      </footer>
    </div>
  );
}
