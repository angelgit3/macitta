import { Logo } from "./Logo";

export function AppHeader() {
    return (
        <div className="flex justify-center sticky top-4 z-50 mb-8 w-full px-4 pointer-events-none">
            <header className="flex items-center py-3 px-6 bg-stone-surface/60 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-all duration-300 hover:border-white/10 hover:bg-stone-surface/80">
                <Logo variant="full" size={20} className="text-white hover:opacity-80 transition-opacity duration-300" iconClassName="text-accent-focus drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </header>
        </div>
    );
}
