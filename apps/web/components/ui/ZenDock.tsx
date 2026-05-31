"use client";

import { GraduationCap, Home, Layers, User, CloudOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSync } from "@/hooks/useSync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const navItems = [
  { icon: Home,          label: "Inicio",     href: "/dashboard" },
  { icon: GraduationCap, label: "TOEFL",      href: "/toefl" },
  { icon: Layers,        label: "Inventario", href: "/vocabulario" },
  { icon: User,          label: "Usuario",    href: "/usuario" },
];

/**
 * ZenDock — Estudio Lúmico
 * Floating glass pill navigation with spring-physics active state.
 */
export function ZenDock() {
  const pathname = usePathname();
  const { isSyncing } = useSync();
  const { isOnline } = useNetworkStatus();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path || pathname === "/";
    return pathname === path || Boolean(pathname?.startsWith(path + "/"));
  };

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
        className="rounded-2xl flex items-center justify-between gap-1 px-2 py-2"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`
                relative flex-1 min-h-12 flex flex-col items-center justify-center gap-1
                rounded-xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${active
                  ? "text-accent bg-accent/10"
                  : "text-ink-faint hover:text-ink hover:bg-white/5"
                }
              `}
            >
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-accent" />
              )}
              <item.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className="transition-transform duration-200"
                style={{ transform: active ? "scale(1.08)" : "scale(1)" }}
              />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
