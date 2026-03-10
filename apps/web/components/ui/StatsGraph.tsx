import React from "react";

interface StatsGraphProps {
    data?: { day: string; value: number; active?: boolean }[];
}

export function StatsGraph({ data = [] }: StatsGraphProps) {
    // If no data, show empty placeholders
    const displayData = data.length > 0 ? data : [
        { day: "L", value: 5 },
        { day: "M", value: 5 },
        { day: "X", value: 5 },
        { day: "J", value: 5 },
        { day: "V", value: 5 },
        { day: "S", value: 5 },
        { day: "D", value: 5 },
    ];

    return (
        <div className="w-full h-40 flex items-end justify-between gap-2 mt-4">
            {displayData.map((item, idx) => (
                <div key={`${item.day}-${idx}`} className="flex flex-col items-center gap-2 flex-1">
                    <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${item.active
                            ? "bg-accent-focus shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            : "bg-white/10 hover:bg-white/20"
                            }`}
                        style={{ height: `${Math.max(item.value, item.value > 0 ? 15 : 5)}%` }}
                    />
                    <span className={`text-xs font-bold ${item.active ? "text-accent-focus" : "text-text-dim"}`}>
                        {item.day}
                    </span>
                </div>
            ))}
        </div>
    );
}
