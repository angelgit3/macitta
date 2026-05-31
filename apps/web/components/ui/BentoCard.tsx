import React from "react";

interface BentoCardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: "periwinkle" | "amber" | "sage" | "none";
}

const accentMap = {
  periwinkle: {
    icon:   "text-accent bg-accent/10 border border-accent/20",
    glow:   "hover:shadow-[0_0_0_1px_rgba(124,133,232,0.18),0_12px_32px_-6px_rgba(0,0,0,0.38)]",
    border: "hover:border-accent/30",
  },
  amber: {
    icon:   "text-amber bg-amber/10 border border-amber/20",
    glow:   "hover:shadow-[0_0_0_1px_rgba(232,184,75,0.18),0_12px_32px_-6px_rgba(0,0,0,0.38)]",
    border: "hover:border-amber/30",
  },
  sage: {
    icon:   "text-success bg-success/10 border border-success/20",
    glow:   "hover:shadow-[0_0_0_1px_rgba(107,203,142,0.18),0_12px_32px_-6px_rgba(0,0,0,0.38)]",
    border: "hover:border-success/30",
  },
  none: {
    icon:   "text-ink-muted bg-white/5 border border-border",
    glow:   "",
    border: "hover:border-border-strong",
  },
};

/**
 * BentoCard — Estudio Lúmico
 * Glass-morphic bento unit with colour-coded accent system.
 */
export function BentoCard({
  title,
  value,
  icon,
  children,
  className = "",
  onClick,
  accent = "periwinkle",
}: BentoCardProps) {
  const a = accentMap[accent];

  return (
    <div
      onClick={onClick}
      className={`
        relative glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden
        ${a.border} ${a.glow}
        ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}
        transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${className}
      `}
    >
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start mb-3">
        {icon && (
          <div className={`${a.icon} rounded-xl p-2.5`}>{icon}</div>
        )}
        {title && (
          <h3 className="label-kicker">{title}</h3>
        )}
      </div>

      {value !== undefined && (
        <div className="text-3xl font-bold text-ink tracking-tight">{value}</div>
      )}

      {children}
    </div>
  );
}
