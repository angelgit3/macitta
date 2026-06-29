import React from "react";

interface StatsGraphDay {
  day: string;
  date: string;
  minutes: number;
  active?: boolean;
}

interface StatsGraphProps {
  data?: StatsGraphDay[];
  targetMinutes?: number;
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = minutes / 60;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)} h`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

/**
 * Weekly study rhythm, tuned for quick dashboard reading.
 * Shows real minutes, goal progress, best day and a visible target line.
 */
export function StatsGraph({ data = [], targetMinutes = 20 }: StatsGraphProps) {
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const activeDays = data.filter((item) => item.minutes > 0).length;
  const averageMinutes = data.length > 0 ? totalMinutes / data.length : 0;
  const bestDay = data.reduce<StatsGraphDay | null>(
    (best, item) => (!best || item.minutes > best.minutes ? item : best),
    null,
  );
  const maxMinutes = Math.max(targetMinutes, bestDay?.minutes ?? 0, 1);
  const targetPosition = Math.min(100, (targetMinutes / maxMinutes) * 100);

  if (data.length === 0) {
    return (
      <div className="mt-4 flex h-44 w-full items-center justify-center rounded-2xl border border-border bg-void/35">
        <p className="text-sm text-ink-faint">No hay datos de actividad aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Semana" value={formatMinutes(totalMinutes)} />
        <Stat label="Promedio" value={`${formatMinutes(averageMinutes)} / día`} />
        <Stat label="Días activos" value={`${activeDays}/7`} />
      </div>

      <div
        className="rounded-2xl border border-border bg-void/35 px-3 py-5 sm:px-5"
        role="img"
        aria-label={`Actividad de los últimos siete días. Total ${formatMinutes(totalMinutes)}. Meta diaria ${targetMinutes} minutos.`}
      >
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-amber/45"
            style={{ bottom: `${targetPosition}%` }}
            aria-hidden="true"
          >
            <span className="absolute -top-3 right-0 rounded-full bg-void px-2 text-[10px] font-bold text-amber">
              Meta {targetMinutes} min
            </span>
          </div>

          <div className="grid h-44 grid-cols-7 items-end gap-2 sm:gap-3">
            {data.map((item, idx) => {
              const rawHeight = (item.minutes / maxMinutes) * 100;
              const height = item.minutes > 0 ? Math.max(rawHeight, 10) : 3;
              const reachedGoal = item.minutes >= targetMinutes;

              return (
                <div
                  key={`${item.date}-${idx}`}
                  className="group flex h-full min-w-0 flex-col items-center justify-end gap-2"
                  title={`${formatDate(item.date)}: ${formatMinutes(item.minutes)}`}
                >
                  <span className={`text-[10px] font-bold ${item.minutes > 0 ? "text-ink-muted" : "text-ink-faint"}`}>
                    {item.minutes > 0 ? formatMinutes(item.minutes).replace(" min", "") : ""}
                  </span>
                  <div className="flex h-full w-full items-end rounded-full bg-surface/55 p-1">
                    <div
                      className={[
                        "w-full rounded-full transition-[height,background-color,box-shadow] duration-300",
                        item.active
                          ? "bg-accent shadow-[0_0_18px_rgba(124,133,232,0.42)]"
                          : reachedGoal
                            ? "bg-amber/80"
                            : item.minutes > 0
                              ? "bg-accent/55 group-hover:bg-accent/70"
                              : "bg-white/8",
                      ].join(" ")}
                      style={{ height: `${height}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${item.active ? "text-accent" : "text-ink-faint"}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <p>
          Mejor día:{" "}
          <span className="font-bold text-ink">
            {bestDay && bestDay.minutes > 0 ? `${bestDay.day}, ${formatMinutes(bestDay.minutes)}` : "sin sesiones"}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Legend color="bg-accent" label="Hoy" />
          <Legend color="bg-amber/80" label="Meta alcanzada" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-void/35 px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}
