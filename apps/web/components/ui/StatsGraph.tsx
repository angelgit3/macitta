import React from "react";

interface StatsGraphDay {
  day: string;
  date: string;
  minutes: number;
  active?: boolean;
}

interface StatsGraphProps {
  data?: StatsGraphDay[];
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

/** Compact weekly rhythm for the daily-first dashboard. */
export function StatsGraph({ data = [] }: StatsGraphProps) {
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const maxMinutes = Math.max(...data.map((item) => item.minutes), 1);

  if (data.length === 0 || totalMinutes === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/45 px-5 py-4">
        <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <p className="text-sm text-ink-muted">Completa tu primera sesión para comenzar a registrar tu ritmo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-black tracking-tight text-ink">Últimos 7 días</h2>
        <p className="text-sm font-medium tabular-nums text-ink-muted">
          {formatMinutes(totalMinutes)} de enfoque
        </p>
      </div>

      <div
        className="grid h-40 grid-cols-7 items-end gap-2 sm:gap-3"
        role="img"
        aria-label={`Actividad de los últimos siete días. Total: ${formatMinutes(totalMinutes)}.`}
      >
        {data.map((item) => {
          const rawHeight = (item.minutes / maxMinutes) * 100;
          const height = item.minutes > 0 ? Math.max(rawHeight, 12) : 0;

          return (
            <div
              key={item.date}
              className="group flex h-full min-w-0 flex-col items-center justify-end gap-2"
              title={`${formatDate(item.date)}: ${formatMinutes(item.minutes)}`}
            >
              <div className="flex h-28 w-full max-w-12 items-end overflow-hidden rounded-lg bg-surface-raised/70">
                <div
                  className={`w-full rounded-lg transition-[height,background-color] duration-200 ${
                    item.active
                      ? "bg-accent"
                      : item.minutes > 0
                        ? "bg-accent/70 group-hover:bg-accent/85"
                        : "bg-transparent"
                  }`}
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className={`text-[0.6875rem] font-bold ${item.active ? "text-accent" : "text-ink-faint"}`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
