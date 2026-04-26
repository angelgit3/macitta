import { Logo } from "./Logo";

export function AppHeader() {
    return (
        <header className="flex justify-between items-center py-6 mb-4 border-b border-border-subtle/50 backdrop-blur-md sticky top-0 z-50">
            <Logo variant="full" size={24} className="text-white hover:opacity-80 transition-opacity duration-300" iconClassName="text-accent-focus drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </header>
    );
}
