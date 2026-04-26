import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ZenDock } from "@/components/ui/ZenDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full max-w-[480px] min-h-screen relative bg-void shadow-[0_0_40px_rgba(59,130,246,0.03)] border-x border-white/[0.02] transition-all duration-500 overflow-x-hidden flex flex-col">
            <BackgroundEffects variant="constrained" />
            
            <div className="relative z-10 flex-1 flex flex-col pb-32">
                <main className="px-6 pt-6 flex flex-col gap-6 flex-1">
                    {children}
                </main>
            </div>
            
            <ZenDock />
        </div>
    );
}
