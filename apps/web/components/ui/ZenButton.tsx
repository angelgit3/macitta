import React from "react";

interface ZenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/**
 * ZenButton — Estudio Lúmico
 * Shared product button with the restrained Luminous interaction language.
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
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-bold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.985] select-none disabled:cursor-not-allowed disabled:opacity-50";

  const sizes = {
    sm: "min-h-9  text-xs  px-4   py-2",
    md: "min-h-11 text-sm  px-6   py-2.5",
    lg: "min-h-13 text-base px-8  py-3.5",
  };

  const variants = {
    primary:
      "border border-accent/20 bg-accent text-void hover:bg-accent-hover",
    secondary:
      "border border-border-strong bg-surface-raised text-ink hover:border-accent/35 hover:text-accent-hover",
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
