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
      {/* Bottom-right amber warmth */}
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-[radial-gradient(ellipse,rgba(232,184,75,0.07),transparent_70%)]" />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(160,163,196,1) 1px, transparent 1px), linear-gradient(90deg, rgba(160,163,196,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(124,133,232,0.4)] to-transparent" />
    </div>
  );
}
