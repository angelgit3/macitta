'use client';

import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { JoinClassForm } from "@/components/ui/JoinClassForm";
import { BookOpen, Target, Cloud, Flame, Clock } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function DashboardClient({ initialCount }: { initialCount: number }) {
    const { stats, loading } = useUserStats();
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check if this user needs onboarding
    useEffect(() => {
        async function checkOnboarding() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_done')
                .eq('id', user.id)
                .single();

            if (profile && !profile.onboarding_done) {
                setShowOnboarding(true);
            }
        }
        checkOnboarding();
    }, []);

    const todayLocal = new Date();
    const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

    const graphData = stats?.dailyActivity.map(a => {
        const [y, m, d] = a.date.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);
        return {
            day: localDate.toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase(),
            value: Math.min((a.minutes / 20) * 100, 100),
            active: a.date === todayStr,
        };
    }) || [];

    const totalTimeFormatted = stats
        ? stats.totalTimeMs >= 3600000
            ? `${(stats.totalTimeMs / 3600000).toFixed(1)}h`
            : `${Math.round(stats.totalTimeMs / 60000)}min`
        : "0min";
    const masteryPercent = stats ? Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100) : 0;
    const streakDays = stats?.streak || 0;

    return (
        <>
            {/* Onboarding modal — renders only on first login */}
            {showOnboarding && userId && (
                <OnboardingModal
                    userId={userId}
                    onDone={() => setShowOnboarding(false)}
                />
            )}


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
                        <div className="text-2xl font-bold">{streakDays} {streakDays === 1 ? 'Día' : 'Días'}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-text-dim flex items-center justify-end gap-1">
                            <Clock size={12} /> Tiempo Total
                        </div>
                        <div className="text-2xl font-bold">{totalTimeFormatted}</div>
                    </div>
                </div>
                <StatsGraph data={graphData} />
            </BentoCard>

            {/* Join a Class */}
            <JoinClassForm />
        </>
    );
}
