import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="w-full max-w-[480px] min-h-screen relative bg-void shadow-[0_0_40px_rgba(59,130,246,0.03)] border-x border-white/[0.02] transition-all duration-500 overflow-x-hidden">
            <BackgroundEffects variant="constrained" />
            
            <div className="relative z-10 min-h-screen flex flex-col">
                {children}
            </div>
        </main>
    );
}
