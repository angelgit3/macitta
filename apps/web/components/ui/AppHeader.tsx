import { Logo } from "./Logo";

export function AppHeader() {
    return (
        <div className="flex justify-center sticky top-0 z-50 mb-4 w-full px-2 pt-2 pb-3 pointer-events-none">
            <header className="flex items-center py-2.5 px-5 glass-panel rounded-lg pointer-events-auto transition-all duration-300 hover:border-ink/20">
                <Logo variant="full" size={20} className="text-ink hover:opacity-85 transition-opacity duration-300" iconClassName="text-accent" textClassName="text-ink-muted" />
            </header>
        </div>
    );
}
