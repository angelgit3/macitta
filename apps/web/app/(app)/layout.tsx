import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ZenDock } from "@/components/ui/ZenDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden border-x border-border/60 bg-void shadow-[0_20px_90px_rgba(0,0,0,0.35)]">
            <BackgroundEffects variant="constrained" />
            
            <div className="relative z-10 flex-1 flex flex-col pb-28 md:pb-32">
                <main className="app-main mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 pt-5 sm:px-8 sm:pt-8 lg:px-10">
                    {children}
                </main>
            </div>
            
            <ZenDock />
        </div>
    );
}
