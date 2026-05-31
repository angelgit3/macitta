import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ZenDock } from "@/components/ui/ZenDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-6xl min-h-dvh relative bg-void/90 shadow-[0_20px_90px_rgba(0,0,0,0.35)] border-x border-border/60 transition-all duration-500 overflow-x-hidden flex flex-col">
            <BackgroundEffects variant="constrained" />
            
            <div className="relative z-10 flex-1 flex flex-col pb-28 md:pb-32">
                <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 flex flex-col gap-6 flex-1">
                    {children}
                </main>
            </div>
            
            <ZenDock />
        </div>
    );
}
