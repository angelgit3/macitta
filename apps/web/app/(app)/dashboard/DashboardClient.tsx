"use client";

import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { useUserStats } from "@/hooks/useUserStats";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Clock, Play, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function DashboardClient({ initialCount }: { initialCount: number }) {
  const { stats, loading } = useUserStats();
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
      date: activity.date,
      minutes: activity.minutes,
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

  const metrics = [
    { label: "Tarjetas", value: initialCount, Icon: BookOpen },
    { label: "Dominio", value: `${masteryPercent}%`, Icon: Target },
    { label: "Estudio", value: totalTimeFormatted, Icon: Clock },
  ];

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal userId={userId} onDone={() => setShowOnboarding(false)} />
      )}

      <section className="product-panel rounded-2xl p-4 sm:p-5" aria-label="Acciones principales">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/estudio/global"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-void transition-colors hover:bg-accent-hover sm:flex-none"
          >
            <Play size={17} fill="currentColor" aria-hidden="true" />
            Empezar sesión
          </Link>
          <Link
            href="/vocabulario"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-border-strong bg-void/45 px-5 text-sm font-bold text-ink-muted transition-colors hover:border-accent/35 hover:text-ink sm:flex-none"
          >
            Mazos
          </Link>
          <Link
            href="/toefl"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-border-strong bg-void/45 px-5 text-sm font-bold text-ink-muted transition-colors hover:border-amber/35 hover:text-ink sm:flex-none"
          >
            TOEFL
          </Link>
        </div>
      </section>

      <section aria-label="Resumen de progreso" className="overflow-hidden rounded-2xl border border-border bg-surface/70">
        <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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

      <section className="product-panel rounded-2xl p-5 sm:p-7" aria-labelledby="activity-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Últimos siete días</p>
            <h2 id="activity-title" className="mt-1 text-xl font-black text-ink">Ritmo de estudio</h2>
          </div>
        </div>
        <div className="mt-6 min-h-56">
          <StatsGraph data={graphData} />
        </div>
      </section>
    </>
  );
}
