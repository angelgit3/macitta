"use client";

import { GraduationCap, Home, Layers, User, CloudOff, Loader2, Shuffle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSync } from "@/hooks/useSync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// Items split around the central study button
const leftItems  = [
  { icon: Home,          label: "Inicio",     href: "/dashboard" },
  { icon: GraduationCap, label: "TOEFL",      href: "/toefl" },
];
const rightItems = [
  { icon: Layers,        label: "Inventario", href: "/vocabulario" },
  { icon: User,          label: "Usuario",    href: "/usuario" },
];

/**
 * ZenDock — Estudio Lúmico
 * Floating glass pill nav with a raised central "Estudiar" action button.
 */
export function ZenDock() {
  const pathname = usePathname();
  const { isSyncing } = useSync();
  const { isOnline }  = useNetworkStatus();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path || pathname === "/";
    return pathname === path || Boolean(pathname?.startsWith(path + "/"));
  };

  const isStudying = pathname?.startsWith("/estudio");

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-4 sm:px-5">
      {/* Sync / offline indicator */}
      {(isSyncing || !isOnline) && (
        <div className="mb-2 mx-auto w-fit flex items-center gap-1.5 px-3 py-1 bg-surface/90 backdrop-blur-md border border-border rounded-full text-[10px] uppercase font-bold text-ink-faint shadow-sm">
          {isSyncing ? (
            <><Loader2 size={10} className="animate-spin text-accent" /> Sincronizando</>
          ) : (
            <><CloudOff size={10} className="text-danger" /> Sin conexión</>
          )}
        </div>
      )}

      {/* Nav pill */}
      <nav
        style={{
          background: "rgba(26,27,46,0.82)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow:
            "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 60px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(160,163,196,0.12)",
        }}
        className="rounded-2xl flex items-center gap-1 px-2 py-2"
      >
        {/* Left items */}
        {leftItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`
                relative flex-1 min-h-12 flex flex-col items-center justify-center gap-1
                rounded-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${active ? "text-accent bg-accent/10" : "text-ink-faint hover:text-ink hover:bg-white/5"}
              `}
            >
              {active && <span className="absolute top-1 w-1 h-1 rounded-full bg-accent" />}
              <item.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ transform: active ? "scale(1.08)" : "scale(1)" }}
                className="transition-transform duration-200"
              />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}

        {/* ── Central study button ────────────────────────────── */}
        <div className="flex-shrink-0 flex flex-col items-center px-1">
          <Link
            href="/estudio/global"
            aria-label="Estudiar ahora"
            style={{
              background: isStudying
                ? "rgba(124,133,232,0.25)"
                : "linear-gradient(135deg, #7C85E8, #9AA2F0)",
              boxShadow: isStudying
                ? "0 0 0 2px rgba(124,133,232,0.45), 0 6px 20px rgba(124,133,232,0.20)"
                : "0 4px 16px rgba(124,133,232,0.45), 0 1px 0 rgba(255,255,255,0.18) inset",
            }}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              border border-accent/25
              transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
              active:scale-[0.93] hover:brightness-110
              -mt-5
            `}
          >
            <Shuffle
              size={22}
              strokeWidth={2.2}
              className={isStudying ? "text-accent" : "text-void"}
            />
          </Link>
          <span
            className="text-[10px] font-bold mt-1"
            style={{ color: isStudying ? "#7C85E8" : "#62658A" }}
          >
            Estudiar
          </span>
        </div>
        {/* ── End central button ──────────────────────────────── */}

        {/* Right items */}
        {rightItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`
                relative flex-1 min-h-12 flex flex-col items-center justify-center gap-1
                rounded-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${active ? "text-accent bg-accent/10" : "text-ink-faint hover:text-ink hover:bg-white/5"}
              `}
            >
              {active && <span className="absolute top-1 w-1 h-1 rounded-full bg-accent" />}
              <item.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ transform: active ? "scale(1.08)" : "scale(1)" }}
                className="transition-transform duration-200"
              />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
