import { Cloud } from "lucide-react";

export function AppHeader() {
    return (
        <header className="flex justify-between items-center py-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-focus flex items-center justify-center">
                    <Cloud size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold">Macitta</h1>
            </div>
        </header>
    );
}
