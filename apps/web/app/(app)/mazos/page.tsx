
import { BentoCard } from "@/components/ui/BentoCard";
import { Layers } from "lucide-react";

export default function DecksPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Mis Mazos</h1>
            <div className="grid grid-cols-1 gap-4">
                <BentoCard title="Verbos Comunes" icon={<Layers size={20} />} value="100 Cartas" />
            </div>
        </div>
    );
}
