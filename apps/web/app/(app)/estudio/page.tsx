
import { BentoCard } from "@/components/ui/BentoCard";
import { Play } from "lucide-react";

export default function StudyPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Estudio</h1>
            <BentoCard title="Sesión Actual" className="min-h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent-focus flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Play size={32} className="text-white ml-1" />
                    </div>
                    <p className="text-text-dim">Presiona para comenzar</p>
                </div>
            </BentoCard>
        </div>
    );
}
