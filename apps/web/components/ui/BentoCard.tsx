import React from "react";

interface BentoCardProps {
    title?: string;
    value?: string | number;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function BentoCard({
    title,
    value,
    icon,
    children,
    className = "",
    onClick,
}: BentoCardProps) {
    return (
        <div
            onClick={onClick}
            className={`relative group bg-stone-surface/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between overflow-hidden hover:border-accent-focus/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-0.5 transition-all duration-500 ${className}`}
        >
            {/* Top inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex justify-between items-start mb-2">
                {icon && <div className="text-accent-focus">{icon}</div>}
                {title && (
                    <h3 className="text-xs font-semibold tracking-wider text-text-dim uppercase">
                        {title}
                    </h3>
                )}
            </div>

            {value && (
                <div className="text-3xl font-bold tracking-tight text-white mt-1">
                    {value}
                </div>
            )}

            {children}
        </div>
    );
}
