import { HTMLAttributes } from "react";

export interface BackgroundEffectsProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "constrained" | "full-width";
}

/**
 * BackgroundEffects — Estudio Lúmico
 * Ambient radial glows + subtle grid, all GPU-safe (opacity + transform only).
 */
export function BackgroundEffects({
  className = "",
  variant = "full-width",
  ...props
}: BackgroundEffectsProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      {...props}
    >
      {/* Top-left periwinkle glow */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(ellipse,rgba(124,133,232,0.14),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-accent/25" />
    </div>
  );
}
