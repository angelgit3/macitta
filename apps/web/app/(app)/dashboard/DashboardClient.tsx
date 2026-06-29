"use client";

import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { useUserStats } from "@/hooks/useUserStats";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  Play,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
        .from("profiles")
        .select("onboarding_done")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_done) setShowOnboarding(true);
    }

    checkOnboarding();
  }, [supabase]);

  const todayLocal = new Date();
  const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

  const graphData = stats?.dailyActivity.map((activity) => {
    const [year, month, day] = activity.date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return {
      day: localDate.toLocaleDateString("es-MX", { weekday: "short" })[0].toUpperCase(),
      value: Math.min((activity.minutes / 20) * 100, 100),
      active: activity.date === todayStr,
    };
  }) ?? [];

  const totalTimeFormatted = stats
    ? stats.totalTimeMs >= 3_600_000
      ? `${(stats.totalTimeMs / 3_600_000).toFixed(1)} h`
      : `${Math.round(stats.totalTimeMs / 60_000)} min`
    : "0 min";
  const masteryPercent = stats
    ? Math.round((stats.masteredCards / Math.max(stats.totalCards, 1)) * 100)
    : 0;
  const streakDays = stats?.streak ?? 0;

  const metrics = [
    { label: "Tarjetas", value: initialCount, Icon: BookOpen },
    { label: "Dominio", value: `${masteryPercent}%`, Icon: Target },
    { label: "Racha", value: `${streakDays} d`, Icon: Flame },
    { label: "Estudio", value: totalTimeFormatted, Icon: Clock },
  ];

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal userId={userId} onDone={() => setShowOnboarding(false)} />
      )}

      <section className="product-panel overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="section-label text-accent">Tu sesión de hoy</p>
            <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight text-ink sm:text-4xl">
              Sigue construyendo memoria, una sesión a la vez.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
              Macitta reúne tus repasos pendientes en una sola ruta y guarda el avance incluso cuando estudias sin conexión.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/estudio/global"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-void transition-colors hover:bg-accent-hover"
              >
                <Play size={17} fill="currentColor" />
                Empezar sesión
              </Link>
              <Link
                href="/vocabulario"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-strong bg-void/45 px-5 text-sm font-bold text-ink-muted transition-colors hover:border-accent/35 hover:text-ink"
              >
                Revisar mazos <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="border-t border-border bg-void/35 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <h2 className="text-sm font-bold text-ink">Estado de aprendizaje</h2>
            <dl className="mt-4 divide-y divide-border">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-ink-muted">Tarjetas dominadas</dt>
                <dd className="font-bold text-ink">{loading ? "—" : stats?.masteredCards ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-ink-muted">Precisión histórica</dt>
                <dd className="font-bold text-ink">{loading ? "—" : stats?.precision == null ? "Sin datos" : `${stats.precision}%`}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-ink-muted">Meta diaria</dt>
                <dd className="font-bold text-ink">20 min</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-label="Resumen de progreso" className="overflow-hidden rounded-2xl border border-border bg-surface/70">
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {metrics.map(({ label, value, Icon }) => (
            <div key={label} className="flex min-h-24 items-center gap-3 p-4 sm:px-5">
              <Icon size={18} className="shrink-0 text-accent" aria-hidden="true" />
              <div>
                <dt className="text-xs text-ink-muted">{label}</dt>
                <dd className="mt-1 text-lg font-black text-ink">{loading && label !== "Tarjetas" ? "—" : value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <section className="product-panel rounded-2xl p-5 sm:p-7" aria-labelledby="activity-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Últimos siete días</p>
              <h2 id="activity-title" className="mt-1 text-xl font-black text-ink">Ritmo de estudio</h2>
            </div>
            <p className="text-sm text-ink-muted">
              {streakDays > 0 ? `${streakDays} ${streakDays === 1 ? "día seguido" : "días seguidos"}` : "Comienza tu primera racha"}
            </p>
          </div>
          <div className="mt-6 min-h-56">
            <StatsGraph data={graphData} />
          </div>
        </section>

        <section className="product-panel rounded-2xl" aria-labelledby="routes-title">
          <div className="p-5 pb-3 sm:px-6 sm:pt-6">
            <p className="section-label">Rutas disponibles</p>
            <h2 id="routes-title" className="mt-1 text-xl font-black text-ink">Elige qué practicar</h2>
          </div>
          <nav aria-label="Rutas de práctica" className="divide-y divide-border">
            <Link href="/toefl" className="group flex min-h-24 items-center gap-4 px-5 py-4 sm:px-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber">
                <GraduationCap size={21} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">Preparación TOEFL</span>
                <span className="mt-1 block text-sm leading-5 text-ink-muted">Reading, Grammar y Listening con resultado inmediato.</span>
              </span>
              <ArrowRight size={17} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
            <Link href="/vocabulario" className="group flex min-h-24 items-center gap-4 px-5 py-4 sm:px-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Layers size={21} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">Mazos y vocabulario</span>
                <span className="mt-1 block text-sm leading-5 text-ink-muted">Organiza tarjetas y revisa tu avance por colección.</span>
              </span>
              <ArrowRight size={17} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          </nav>
        </section>
      </div>
    </>
  );
}
