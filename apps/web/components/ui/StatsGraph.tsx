import React from "react";

export function StatsGraph() {
    const data = [
        { day: "M", value: 30 },
        { day: "T", value: 50 },
        { day: "W", value: 100, active: true },
        { day: "T", value: 20 },
        { day: "F", value: 45 },
        { day: "S", value: 40 },
        { day: "S", value: 25 },
    ];

    return (
        <div className="w-full h-40 flex items-end justify-between gap-2 mt-4">
            {data.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                    <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${item.active
                                ? "bg-accent-focus shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                : "bg-white/10 hover:bg-white/20"
                            }`}
                        style={{ height: `${item.value}%` }}
                    />
                    <span className={`text-xs font-bold ${item.active ? "text-accent-focus" : "text-text-dim"}`}>
                        {item.day}
                    </span>
                </div>
            ))}
        </div>
    );
}
