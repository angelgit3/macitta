
import { BentoCard } from "@/components/ui/BentoCard";
import { User } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Perfil</h1>
            <BentoCard title="Usuario" icon={<User size={20} />} className="min-h-[100px]">
                <div className="mt-4">
                    <p className="text-lg font-medium">Angel Anaya</p>
                    <p className="text-text-dim">Estudiante</p>
                </div>
            </BentoCard>

            <BentoCard title="Estadísticas" className="min-h-[100px]">
                <p className="text-text-dim">Tus estadísticas aparecerán aquí.</p>
            </BentoCard>
        </div>
    );
}
