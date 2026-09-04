import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";
import { MacittaMarkIcon } from "@/components/ui/Logo";
import { ScallopDivider, Sticker } from "@/components/ui/BrandShapes";

export const metadata: Metadata = {
  title: "Página no encontrada — Macitta",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-void text-ink">
      <section className="relative isolate flex flex-1 flex-col bg-accent text-void">
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
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 items-center justify-center px-3 text-sm font-bold text-void transition-colors hover:text-void/80 sm:px-4"
            >
              Entrar
            </Link>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-8">
          <h1 className="relative max-w-full select-none text-[clamp(5rem,22vw,16rem)] font-black leading-[0.85] tracking-[-0.055em] opacity-0 animate-fade-in-up">
            404<span className="text-amber">.</span>
            <Sticker className="absolute -right-2 top-2 hidden rotate-6 bg-void text-ink sm:inline-flex lg:-right-20 animate-float">
              <MapPinOff size={13} />
              Sin ruta
            </Sticker>
          </h1>

          <p className="mt-8 max-w-[42ch] text-balance text-xl font-bold leading-8 text-void opacity-0 animate-fade-in-up [animation-delay:90ms] sm:text-2xl sm:leading-9">
            Esta página no está en tu mazo.
          </p>
          <p className="mt-4 max-w-[52ch] text-pretty text-base leading-7 text-void/85 opacity-0 animate-fade-in-up [animation-delay:180ms]">
            El enlace puede estar roto o la página se movió. No te preocupes:
            tu progreso y tus repasos siguen exactamente donde los dejaste.
          </p>

          <div className="mt-9 flex flex-col gap-3 opacity-0 animate-fade-in-up [animation-delay:270ms] sm:flex-row">
            <Link
              href="/"
              className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-void px-7 py-3.5 text-base font-black text-ink shadow-[0_16px_40px_-12px_rgba(13,14,23,0.55)] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
            >
              <ArrowLeft
                size={18}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              Volver al inicio
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-13 items-center justify-center rounded-xl border-2 border-void/30 px-7 py-3.5 text-base font-bold text-void transition-[border-color,background-color,transform] duration-200 hover:border-void/60 hover:bg-void/5 active:scale-[0.97]"
            >
              Ir a estudiar
            </Link>
          </div>
        </div>

        <ScallopDivider fill="#0D0E17" />
      </section>
    </div>
  );
}
