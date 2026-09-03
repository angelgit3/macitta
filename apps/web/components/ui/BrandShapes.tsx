import React from "react";

/* ─── Divisor orgánico tipo nube ───────────────────────────
   Fila de arcos suaves que conecta dos secciones de distinto
   color. `fill` = color de la sección siguiente. */
export function ScallopDivider({
  fill,
  className = "",
}: {
  fill: string;
  className?: string;
}) {
  const width = 1440;
  const bump = 180;
  const base = 64;
  const height = 124;
  let d = `M0 ${height} L0 ${base} Q ${bump / 2} -14 ${bump} ${base}`;
  for (let x = bump; x < width; x += bump) {
    d += ` T ${x + bump} ${base}`;
  }
  d += ` L ${width} ${height} Z`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block h-[72px] w-full sm:h-[104px] ${className}`.trim()}
    >
      <path d={d} fill={fill} />
    </svg>
  );
}

/* ─── Etiqueta tipo sticker ───────────────────────────────
   Píldora con borde grueso, sombra dura y ligera rotación.
   Siempre en una sola línea, con métricas propias para no
   heredar tipografía display de un titular cercano. */
export function Sticker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-void/85 px-3.5 py-1.5 text-xs font-black leading-none tracking-normal shadow-[0_10px_24px_-8px_rgba(0,0,0,0.55)] ${className}`}
    >
      {children}
    </span>
  );
}
