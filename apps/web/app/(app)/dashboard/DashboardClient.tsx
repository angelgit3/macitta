'use client';

import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { BookOpen, Target, Cloud, Flame, Clock } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export function DashboardClient({ initialCount }: { initialCount: number }) {
    const { stats, loading } = useUserStats();

    // Map daily activity to graph data
    const graphData = stats?.dailyActivity.map(a => ({
        day: new Date(a.date).toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase(),
        value: Math.min((a.minutes / 20) * 100, 100), // Percent of a 20min goal
        active: new Date(a.date).toDateString() === new Date().toDateString()
    })) || [];

    const totalHours = stats ? (stats.totalTimeMs / 3600000).toFixed(1) : "0.0";
    const masteryPercent = stats ? Math.round((stats.masteredCards / stats.totalCards) * 100) : 0;

    return (
        <>
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <BentoCard icon={<BookOpen size={20} />} title="Verbos" value={initialCount} />
                <BentoCard
                    icon={<Target size={20} className={`text-accent-success ${loading ? 'animate-pulse' : ''}`} />}
                    title="Maestría"
                    value={`${masteryPercent}%`}
                />
            </div>

            {/* Cloud Sync Status */}
            <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-text-dim">
                    <Cloud size={16} />
                    <span>Progreso Guardado</span>
                </div>
                <span className="text-sm font-bold text-accent-success">Sincronizado</span>
            </div>

            {/* Activity Graph */}
            <BentoCard title="Actividad" className="h-[320px]">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-text-dim flex items-center gap-1">
                            <Flame size={12} className="text-orange-500" /> Racha
                        </div>
                        <div className="text-2xl font-bold">{stats?.streak || 0} Días</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-text-dim flex items-center justify-end gap-1">
                            <Clock size={12} /> Tiempo Total
                        </div>
                        <div className="text-2xl font-bold">
                            {totalHours}h
                        </div>
                    </div>
                </div>
                <StatsGraph data={graphData} />
            </BentoCard>
        </>
    );
}
