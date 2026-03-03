"use client";

import React from "react";
import { Home, Layers, Play, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ZenDock() {
    const pathname = usePathname();

    const allNavItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: Play, label: "Estudio", href: "/estudio" },
        { icon: Layers, label: "Inventario", href: "/vocabulario" },
        { icon: User, label: "Usuario", href: "/usuario" },
    ];

    const isActive = (path: string) => pathname === path || (path === "/dashboard" && pathname === "/") || (pathname?.startsWith(path) && path !== "/dashboard");

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-6">
            <nav className="bg-stone-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-8 shadow-2xl shadow-black/50">
                {allNavItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive(item.href) ? "text-accent-focus" : "text-text-dim hover:text-white"
                            }`}
                    >
                        <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                    </Link>
                ))}
            </nav>
        </div>
    );
}
