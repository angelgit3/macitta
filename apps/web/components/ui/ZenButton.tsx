import React from "react";

interface ZenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/**
 * ZenButton — Estudio Lúmico
 * Pill-shaped, spring physics on active, gradient primary.
 */
export function ZenButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ZenButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-bold rounded-full overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "min-h-9  text-xs  px-4   py-2",
    md: "min-h-11 text-sm  px-6   py-2.5",
    lg: "min-h-13 text-base px-8  py-3.5",
  };

  const variants = {
    primary:
      "bg-accent text-void shadow-[0_8px_24px_rgba(124,133,232,0.32)] hover:bg-accent-hover hover:shadow-[0_12px_32px_rgba(124,133,232,0.42)] border border-[rgba(124,133,232,0.2)]",
    secondary:
      "glass-card text-ink hover:border-accent/35 hover:text-accent-hover",
    ghost:
      "bg-transparent text-ink-muted hover:text-ink hover:bg-[rgba(124,133,232,0.08)] border border-transparent",
    danger:
      "bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 hover:border-danger/45",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
