import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full relative flex flex-col items-center justify-center min-h-dvh px-4 py-8 bg-void overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-8 hover:opacity-80 transition-opacity group">
          <Logo
            variant="full"
            size={30}
            className="text-ink"
            iconClassName="text-accent group-hover:text-accent-hover transition-colors"
            textClassName="text-ink-muted hover:text-ink transition-colors"
          />
        </Link>

        {/* Auth card — Double-Bezel */}
        <div className="w-full p-[2px] rounded-[1.55rem] bg-gradient-to-b from-white/12 via-white/4 to-white/0">
          <div
            className="w-full glass-panel rounded-[1.4rem] p-6 sm:p-8"
            style={{
              boxShadow:
                "0 1px 0 0 rgba(255,255,255,0.07) inset, 0 28px 70px -10px rgba(0,0,0,0.55)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
