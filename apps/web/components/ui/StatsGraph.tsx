import React from "react";

interface StatsGraphProps {
  data?: { day: string; value: number; active?: boolean }[];
}

/**
 * StatsGraph — Estudio Lúmico
 * Animated bar chart with periwinkle active bars and smooth transitions.
 */
export function StatsGraph({ data = [] }: StatsGraphProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center mt-4">
        <p className="text-xs text-ink-faint">No hay datos de actividad aún</p>
      </div>
    );
  }

  return (
    <div className="w-full h-40 flex items-end justify-between gap-2 mt-4">
      {data.map((item, idx) => (
        <div
          key={`${item.day}-${idx}`}
          className="h-full flex flex-col items-center justify-end gap-2 flex-1"
        >
          <div
            className={`
              w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
              ${item.active
                ? "bg-accent shadow-[0_0_18px_rgba(124,133,232,0.45)]"
                : "bg-ink/8 hover:bg-accent/20"
              }
            `}
            style={{ height: `${Math.max(item.value, item.value > 0 ? 15 : 4)}%` }}
          />
          <span
            className={`text-[10px] font-bold transition-colors ${
              item.active ? "text-accent" : "text-ink-faint"
            }`}
          >
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}
