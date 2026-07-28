"use client";

import { BookOpenCheck, CloudOff, Home, Layers, LibraryBig, Loader2, Shuffle, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSync } from "@/hooks/useSync";

const leftItems = [
  { icon: Home, label: "Inicio", href: "/dashboard" },
  { icon: BookOpenCheck, label: "Grammar", href: "/grammar" },
  { icon: LibraryBig, label: "Reading", href: "/reading" },
];
const rightItems = [
  { icon: Layers, label: "Mazos", href: "/vocabulario" },
  { icon: User, label: "Perfil", href: "/usuario" },
];

function DockItem({ icon: Icon, label, href, active }: {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
}) {
  const { pending } = useLinkStatus();
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-bold transition-colors duration-200 ${
        active ? "text-accent" : "text-ink-faint hover:bg-white/5 hover:text-ink"
      }`}
    >
      <span className="relative flex size-5 items-center justify-center" aria-hidden="true">
        <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={pending ? "opacity-0" : "opacity-100"} />
        {pending && <Loader2 size={18} className="absolute animate-spin text-accent" />}
      </span>
      {label}
    </Link>
  );
}

export function ZenDock() {
  const pathname = usePathname();
  const { isSyncing } = useSync();
  const { isOnline } = useNetworkStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isActive = (path: string) => path === "/dashboard"
    ? pathname === path || pathname === "/"
    : pathname === path || Boolean(pathname?.startsWith(`${path}/`));
  const isStudying = Boolean(pathname?.startsWith("/estudio"));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-6xl border-t border-border bg-void px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:bottom-5 sm:max-w-[520px] sm:rounded-2xl sm:border">
      {mounted && (isSyncing || !isOnline) && (
        <div className="absolute bottom-full left-1/2 mb-2 flex w-fit -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[0.6875rem] font-bold text-ink-muted shadow-sm">
          {isSyncing ? <><Loader2 size={11} className="animate-spin text-accent" /> Sincronizando</> : <><CloudOff size={11} /> Sin conexión</>}
        </div>
      )}

      <nav className="flex items-end gap-1" aria-label="Navegación principal">
        {leftItems.map((item) => <DockItem key={item.href} {...item} active={isActive(item.href)} />)}

        <Link
          href="/estudio/global"
          aria-label="Estudiar ahora"
          aria-current={isStudying ? "page" : undefined}
          className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[0.6875rem] font-bold transition-colors ${isStudying ? "text-accent" : "text-ink-faint hover:bg-white/5 hover:text-ink"}`}
        >
          <span
            aria-hidden="true"
            className={`flex size-12 items-center justify-center rounded-full border border-accent/35 transition-[background-color,transform] duration-200 active:scale-[0.94] ${
              isStudying ? "bg-accent/20 text-accent" : "bg-accent text-void"
            }`}
          >
            <Shuffle size={21} strokeWidth={2.3} aria-hidden="true" />
          </span>
          <span>Estudiar</span>
        </Link>

        {rightItems.map((item) => <DockItem key={item.href} {...item} active={isActive(item.href)} />)}
      </nav>
    </div>
  );
}
