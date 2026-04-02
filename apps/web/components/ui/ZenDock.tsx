"use client";

import React, { useEffect, useState } from "react";
import { Home, Layers, Play, User, BookOpen, GraduationCap, Cloud, CloudOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSync } from "@/hooks/useSync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function ZenDock() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { isSyncing } = useSync();
    const isOnline = useNetworkStatus();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                setLoading(false);
                return;
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();
            if (profile?.role) setRole(profile.role);
            setLoading(false);
        });
    }, []);

    const studentItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: Play, label: "Estudio", href: "/estudio" },
        { icon: Layers, label: "Inventario", href: "/vocabulario" },
        { icon: GraduationCap, label: "Clases", href: "/mis-clases" },
        { icon: User, label: "Usuario", href: "/usuario" },
    ];

    const teacherItems = [
        { icon: BookOpen, label: "Grupos", href: "/docente" },
        { icon: User, label: "Usuario", href: "/usuario" },
    ];

    const allNavItems = role === "teacher" ? teacherItems : studentItems;

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === path || pathname === "/";
        return pathname === path || Boolean(pathname?.startsWith(path + "/"));
    };

    // Mostrar skeleton mientras carga para evitar salto de layout
    if (loading) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-6">
                <nav className="bg-stone-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-8 shadow-2xl shadow-black/50">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                    ))}
                </nav>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-6">
            <nav className="bg-stone-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-8 shadow-2xl shadow-black/50 relative">
                {/* Sync Indicator */}
                <div className="absolute -top-3 right-4 flex items-center gap-1.5 px-2 py-1 bg-void border border-border-subtle rounded-full text-[10px] uppercase font-bold tracking-widest text-text-dim shadow-sm">
                    {isSyncing ? (
                        <><Loader2 size={10} className="animate-spin text-accent-focus" /> Sincronizando</>
                    ) : !isOnline ? (
                        <><CloudOff size={10} className="text-red-400" /> Sin conexión</>
                    ) : null}
                </div>

                {allNavItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
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
