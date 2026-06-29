"use client";

import { Logo } from "@/components/ui/Logo";

// Offline fallback page — served by the SW when navigation fails without cache.
// This page is statically precached during build by @serwist/next.

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
            {/* App mark */}
            <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-surface border border-ink/5 flex items-center justify-center shadow-xl">
                    <Logo size={42} className="text-accent" />
                </div>
                <div className="absolute inset-0 -z-10 rounded-3xl bg-accent/10 blur-xl" />
            </div>

            {/* Text */}
            <h1 className="text-xl font-bold text-ink mb-2">Sin conexión</h1>
            <p className="text-sm text-ink-faint max-w-xs leading-relaxed">
                No pudimos cargar esta página. Revisa tu conexión a internet e inténtalo de nuevo.
            </p>

            {/* Retry button — navigates back to trigger SW fetch */}
            <button
                onClick={() => window.location.reload()}
                className="mt-8 px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface border border-ink/5 text-ink hover:border-ink/10 hover:bg-surface-raised transition-all active:scale-95"
            >
                Reintentar
            </button>
        </div>
    );
}
