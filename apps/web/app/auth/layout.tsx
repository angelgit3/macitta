import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full relative flex flex-col items-center justify-center min-h-screen p-6 bg-void overflow-hidden">
            <BackgroundEffects variant="full-width" />
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
                    <Logo variant="full" size={32} className="text-white" iconClassName="text-accent-focus" textClassName="text-text-dim hover:text-white transition-colors" />
                </Link>
                <div className="w-full backdrop-blur-lg bg-white/[0.02] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
