import { Logo } from "./Logo";

export function AppHeader() {
    return (
        <header className="flex justify-between items-center py-2">
            <Logo variant="full" size={28} className="text-white" iconClassName="text-accent-focus" />
        </header>
    );
}
