"use client";

import React from "react";
import { Home, Layers, Plus, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ZenDock() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Layers, label: "Decks", href: "/decks" },
    ];

    const secondaryItems = [
        { icon: BarChart2, label: "Stats", href: "/stats" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-6">
            <nav className="bg-stone-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-6 shadow-2xl shadow-black/50">

                {/* Left Group */}
                <div className="flex gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive(item.href) ? "text-accent-focus" : "text-text-dim hover:text-white"
                                }`}
                        >
                            <item.icon size={22} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                            {/* <span className="text-[10px] font-medium">{item.label}</span> */}
                        </Link>
                    ))}
                </div>

                {/* Center FLOTTING FAB */}
                <div className="relative -top-6">
                    <button className="bg-accent-focus text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-void hover:scale-105 active:scale-95 transition-transform">
                        <Plus size={28} strokeWidth={3} />
                    </button>
                </div>

                {/* Right Group */}
                <div className="flex gap-6">
                    {secondaryItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive(item.href) ? "text-accent-focus" : "text-text-dim hover:text-white"
                                }`}
                        >
                            <item.icon size={22} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
