"use client";

// Offline fallback page — served by the SW when navigation fails without cache.
// This page is statically precached during build by @serwist/next.

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
            {/* Glowing cloud icon */}
            <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-stone-surface border border-white/5 flex items-center justify-center shadow-xl">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M10 28C6.686 28 4 25.314 4 22C4 19.013 6.163 16.527 9.028 16.066C9.01 15.716 9 15.36 9 15C9 10.582 12.582 7 17 7C20.302 7 23.146 8.966 24.434 11.784C25.1 11.606 25.8 11.5 26.5 11.5C30.09 11.5 33 14.41 33 18C33 18.3 32.98 18.594 32.944 18.882C35.296 19.696 37 21.916 37 24.5C37 27.814 34.314 30.5 31 30.5H10V28Z"
                            fill="currentColor"
                            className="text-stone-light"
                        />
                        <path
                            d="M10 28C6.686 28 4 25.314 4 22C4 19.013 6.163 16.527 9.028 16.066C9.01 15.716 9 15.36 9 15C9 10.582 12.582 7 17 7C20.302 7 23.146 8.966 24.434 11.784C25.1 11.606 25.8 11.5 26.5 11.5C30.09 11.5 33 14.41 33 18C33 18.3 32.98 18.594 32.944 18.882C35.296 19.696 37 21.916 37 24.5C37 27.814 34.314 30.5 31 30.5H10V28Z"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1"
                        />
                        {/* Offline slash */}
                        <line
                            x1="8"
                            y1="8"
                            x2="32"
                            y2="32"
                            stroke="rgba(239,68,68,0.7)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                {/* Ambient glow */}
                <div className="absolute inset-0 rounded-3xl bg-red-500/5 blur-xl -z-10" />
            </div>

            {/* Text */}
            <h1 className="text-xl font-bold text-stone-100 mb-2">Sin conexión</h1>
            <p className="text-sm text-text-dim max-w-xs leading-relaxed">
                No pudimos cargar esta página. Revisá tu conexión a internet e intentá de nuevo.
            </p>

            {/* Retry button — navigates back to trigger SW fetch */}
            <button
                onClick={() => window.location.reload()}
                className="mt-8 px-5 py-2.5 rounded-xl text-sm font-semibold bg-stone-surface border border-white/5 text-stone-100 hover:border-white/10 hover:bg-stone-light transition-all active:scale-95"
            >
                Reintentar
            </button>
        </div>
    );
}
