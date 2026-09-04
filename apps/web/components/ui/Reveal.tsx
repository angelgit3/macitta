"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Retraso de la transición en ms, para escalonar bloques hermanos. */
  delay?: number;
};

/**
 * Scroll-reveal para superficies de marketing. Se dispara una sola vez vía
 * IntersectionObserver. El estado oculto solo se "arma" después de montar,
 * así el HTML renderizado en servidor siempre es visible: sin JS, con
 * prefers-reduced-motion, o si el bloque ya está en viewport al cargar,
 * el contenido aparece sin animación.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const alreadyInView =
      el.getBoundingClientRect().top < window.innerHeight * 0.92;

    if (reduce || alreadyInView || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    setArmed(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-armed={armed}
      data-visible={visible}
      className={["reveal", className].filter(Boolean).join(" ")}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
