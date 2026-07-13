import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-void px-4 py-8">
      <BackgroundEffects />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="group mb-8 transition-opacity hover:opacity-80">
          <Logo
            variant="full"
            size={30}
            className="text-ink"
            iconClassName="text-accent transition-colors group-hover:text-accent-hover"
            textClassName="text-ink-muted transition-colors hover:text-ink"
          />
        </Link>
        <div className="w-full rounded-3xl border border-border bg-surface p-6 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
