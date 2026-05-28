"use client";

import { GraduationCap, Home, Layers, User, CloudOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSync } from "@/hooks/useSync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: GraduationCap, label: "TOEFL", href: "/toefl" },
    { icon: Layers, label: "Inventario", href: "/vocabulario" },
    { icon: User, label: "Usuario", href: "/usuario" },
];

export function ZenDock() {
    const pathname = usePathname();
    const { isSyncing } = useSync();
    const { isOnline } = useNetworkStatus();

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === path || pathname === "/";
        return pathname === path || Boolean(pathname?.startsWith(path + "/"));
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] px-6">
            <nav className="bg-stone-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-8 shadow-2xl shadow-black/50 relative">
                {(isSyncing || !isOnline) && (
                    <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-2 py-1 bg-void border border-border-subtle rounded-full text-[10px] uppercase font-bold tracking-widest text-text-dim shadow-sm">
                        {isSyncing ? (
                            <><Loader2 size={10} className="animate-spin text-accent-focus" /> Sincronizando</>
                        ) : (
                            <><CloudOff size={10} className="text-red-400" /> Sin conexion</>
                        )}
                    </div>
                )}

                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        aria-label={item.label}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                            isActive(item.href) ? "text-accent-focus" : "text-text-dim hover:text-white"
                        }`}
                    >
                        <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                    </Link>
                ))}
            </nav>
        </div>
    );
}
