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
            className={`bg-stone-surface border border-border-subtle rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors ${className}`}
        >
            <div className="flex justify-between items-start mb-2">
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
