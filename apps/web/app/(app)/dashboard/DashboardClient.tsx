'use client';

import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import {
  ArrowRight, BookOpen, Clock, Cloud, CloudOff,
  Flame, GraduationCap, Shuffle, Target,
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export function DashboardClient({ initialCount }: { initialCount: number }) {
  const { stats, loading } = useUserStats();
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      if (profile && !profile.onboarding_done) setShowOnboarding(true);
    }
    checkOnboarding();
  }, [supabase]);

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
  const masteryPercent = stats
    ? Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100)
    : 0;
  const streakDays = stats?.streak || 0;

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal userId={userId} onDone={() => setShowOnboarding(false)} />
      )}

      {/* ── Hero panel ─────────────────────────────── */}
      <section className="glass-panel rounded-2xl p-5 sm:p-7 overflow-hidden relative">
        {/* Accent glow top-right */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(ellipse,rgba(124,133,232,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(124,133,232,0.45)] to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="max-w-2xl">
            <span className="pill-badge bg-accent/10 text-accent border border-accent/20 mb-4">
              <Flame size={11} />
              Centro de estudio
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-ink">
              Tu ruta de memoria para hoy
            </h1>
            <p className="readable-copy mt-2">
              Revisa lo pendiente, entra a TOEFL o administra tus mazos sin perder el hilo.
            </p>
          </div>

          {/* Sync status badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-full text-xs font-bold text-success shrink-0">
            <Cloud size={14} />
            Sincronizado
          </div>
        </div>
      </section>

      {/* ── Stat bento row ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BentoCard icon={<BookOpen size={18} />} title="Verbos"   value={initialCount}     accent="periwinkle" />
        <BentoCard icon={<Target   size={18} className={loading ? "animate-pulse" : ""} />}
                   title="Maestría" value={`${masteryPercent}%`} accent="sage" />
        <BentoCard icon={<Flame    size={18} />} title="Racha"    value={`${streakDays}d`} accent="amber" />
        <BentoCard icon={<Clock    size={18} />} title="Tiempo"   value={totalTimeFormatted} accent="none" />
      </div>

      {/* ── Quick-action cards ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Primary CTA — global study */}
        <Link
          href="/estudio/global"
          className="group relative glass-card rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden
                     hover:border-accent/35 hover:shadow-[0_0_0_1px_rgba(124,133,232,0.18),0_12px_32px_-6px_rgba(0,0,0,0.4)]
                     transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
        >
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Shuffle size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-ink">Estudiar con un botón</h2>
              <p className="text-xs text-ink-muted mt-0.5">Repasa tarjetas vencidas de todos tus mazos</p>
            </div>
          </div>

          <ArrowRight
            size={18}
            className="relative z-10 text-ink-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          />
        </Link>

        {/* Secondary — TOEFL */}
        <Link
          href="/toefl"
          className="group relative glass-card rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden
                     hover:border-amber/30 hover:shadow-[0_0_0_1px_rgba(232,184,75,0.15),0_12px_32px_-6px_rgba(0,0,0,0.4)]
                     transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber/6 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/35 to-transparent" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center text-amber shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-ink">Prácticas TOEFL</h2>
              <p className="text-xs text-ink-muted mt-0.5">Reading y Grammar con score inmediato</p>
            </div>
          </div>

          <ArrowRight
            size={18}
            className="relative z-10 text-ink-faint group-hover:text-amber group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          />
        </Link>
      </div>

      {/* ── Activity graph ─────────────────────────── */}
      <BentoCard title="Actividad" className="min-h-[320px]" accent="none">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-1.5 label-kicker mb-1">
              <Flame size={11} className="text-amber" /> Racha
            </div>
            <div className="text-2xl font-bold text-ink">
              {streakDays} {streakDays === 1 ? "día" : "días"}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 label-kicker mb-1">
              <Clock size={11} /> Tiempo total
            </div>
            <div className="text-2xl font-bold text-ink">{totalTimeFormatted}</div>
          </div>
        </div>
        <StatsGraph data={graphData} />
      </BentoCard>
    </>
  );
}
