'use client';

import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { BookOpen, Target, Cloud, Flame, Clock, Users, Loader2, CheckCircle2 } from "lucide-react";
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
            <JoinClassCard />
        </>
    );
}

function JoinClassCard() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError(null);

        const { data: classroom } = await supabase
            .from("classrooms")
            .select("id")
            .eq("join_code", code.toUpperCase().trim())
            .single();

        if (!classroom) {
            setError("Código inválido. Verifica con tu maestro.");
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { error: insertErr } = await supabase
            .from("classroom_students")
            .insert({ classroom_id: classroom.id, student_id: user.id });

        if (insertErr?.code === "23505") {
            setError("Ya estás inscrito en ese grupo.");
        } else if (insertErr) {
            setError("No se pudo unir al grupo. Intenta de nuevo.");
        } else {
            setSuccess(true);
            setCode("");
        }
        setLoading(false);
    }

    return (
        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Users size={16} className="text-emerald-400" />
                <span>Unirme a una clase</span>
            </div>
            {success ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle2 size={16} />
                    ¡Te uniste al grupo exitosamente!
                </div>
            ) : (
                <form onSubmit={handleJoin} className="flex gap-2">
                    <input
                        value={code}
                        onChange={e => { setCode(e.target.value); setError(null); }}
                        placeholder="Código del maestro"
                        maxLength={6}
                        className="flex-1 bg-void/50 border border-border-subtle rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-all uppercase tracking-widest font-bold placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                    />
                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : "Unirme"}
                    </button>
                </form>
            )}
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
    );
}
