import Link from "next/link";
import { MacittaMarkIcon } from "@/components/ui/Logo";
import { ScallopDivider } from "@/components/ui/BrandShapes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-void">
      {/* Banda de marca periwinkle, igual que el hero de la home */}
      <div className="bg-accent text-void">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-2 pt-14 text-center sm:pt-16">
          <Link
            href="/"
            aria-label="Macitta, inicio"
            className="inline-flex min-h-11 items-center gap-3 transition-opacity hover:opacity-80"
          >
            <MacittaMarkIcon size={34} color="#0D0E17" />
            <span className="text-3xl font-black tracking-[-0.04em]">
              macitta<span className="text-amber">.</span>
            </span>
          </Link>
          <p className="mt-3 text-sm font-bold text-void/85">
            Estudio diario con repetición espaciada
          </p>
        </div>
        <ScallopDivider fill="#0D0E17" className="mt-6 h-[48px] sm:h-[64px]" />
      </div>

      {/* Tarjeta del formulario */}
      <main className="flex flex-1 flex-col items-center px-4 pb-10 pt-8 sm:pt-10">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
