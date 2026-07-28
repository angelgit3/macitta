"use client";

import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { APP_CONFIG } from "@/config/constants";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useUserStats } from "@/hooks/useUserStats";
import { createClient } from "@/utils/supabase/client";
import { Check, CloudOff, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function toLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function greetingFor(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardClient() {
  const { stats, loading } = useUserStats();
  const { isOnline } = useNetworkStatus();
  const supabase = useMemo(() => createClient(), []);
  const todayLabel = useMemo(() => new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date()), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hour, setHour] = useState(12);

  useEffect(() => {
    setHour(new Date().getHours());
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

  const todayStr = toLocalDate(new Date());
  const graphData = stats?.dailyActivity.map((activity) => {
    const [year, month, day] = activity.date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return {
      day: new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(localDate).replace(".", "").slice(0, 3),
      date: activity.date,
      minutes: activity.minutes,
      active: activity.date === todayStr,
    };
  }) ?? [];

  const dueCards = stats?.dueCards ?? 0;
  const nextSessionCards = Math.min(dueCards, APP_CONFIG.STUDY_SESSION.BATCH_SIZE);
  const reviewCopy = loading
    ? "Preparando tu sesión"
    : dueCards === 0
      ? "Estás al día"
      : `${nextSessionCards} ${nextSessionCards === 1 ? "tarjeta" : "tarjetas"} en tu próxima sesión`;

  return (
    <>
      {showOnboarding && userId && (
        <OnboardingModal userId={userId} onDone={() => setShowOnboarding(false)} />
      )}

      <header className="pt-1 sm:pt-3">
        <Link href="/dashboard" className="min-h-11 text-2xl font-black tracking-[-0.04em] text-ink sm:text-3xl" aria-label="Macitta, inicio">
          macitta<span className="text-accent">.</span>
        </Link>
      </header>

      <section className="pt-3 sm:pt-5" aria-labelledby="daily-greeting">
        <div className="flex items-start gap-2 text-sm font-medium text-ink-muted" role="status" aria-live="polite">
          {isOnline ? (
            <><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-success text-success"><Check size={12} strokeWidth={3} /></span> Conexión disponible</>
          ) : (
            <><CloudOff size={17} className="mt-0.5 shrink-0 text-ink-faint" /><span>Trabajas sin conexión<span className="block text-xs font-normal text-ink-faint">Tu progreso se guardará en este dispositivo.</span></span></>
          )}
        </div>

        <h1 id="daily-greeting" className="mt-6 text-[2rem] font-black leading-[1.08] tracking-[-0.035em] text-ink sm:text-4xl">
          {greetingFor(hour)}{loading ? "" : `, ${stats?.displayName}`}
        </h1>
        <p className="mt-3 text-sm text-ink-muted first-letter:uppercase">{todayLabel}</p>
      </section>

      <section className="daily-focus-panel rounded-3xl p-6 sm:p-8" aria-labelledby="daily-study-title">
        <p className="text-base font-bold text-accent-hover">Tu estudio de hoy</p>
        <h2 id="daily-study-title" className="mt-3 text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
          {reviewCopy}
        </h2>
        {!loading && dueCards > nextSessionCards && (
          <p className="mt-2 text-sm text-ink-muted">{dueCards} pendientes en total</p>
        )}
        {loading ? (
          <button disabled className="mt-8 inline-flex min-h-14 w-full cursor-wait items-center justify-center gap-3 rounded-xl bg-accent/45 px-6 text-base font-black text-void/70" aria-label="Preparando sesión">
            <Loader2 size={20} className="animate-spin" aria-hidden="true" /> Preparando sesión
          </button>
        ) : (
          <Link href="/estudio/global" className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent px-6 text-base font-black text-void transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-[0.985]">
            <Play size={21} fill="currentColor" aria-hidden="true" />
            {dueCards === 0 ? "Practicar de nuevo" : "Comenzar sesión"}
          </Link>
        )}
      </section>

      <section className="pb-8 sm:pb-12" aria-label="Ritmo semanal">
        <StatsGraph data={graphData} />
      </section>
    </>
  );
}
